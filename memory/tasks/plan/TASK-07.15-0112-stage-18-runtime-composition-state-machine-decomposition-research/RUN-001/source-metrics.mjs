/* global console, process */
import crypto from 'node:crypto'
import fs from 'node:fs'
import ts from 'typescript'

const couplingProfiles = {
    'container.ts': {
        functionName: 'createRuntime',
        identifiers: [
            'registrations',
            'lifetimeValidationOptions',
            'providerGraphSnapshot',
            'lifetimeValidation',
            'runtimeState'
        ]
    },
    'composer.ts': {
        functionName: 'createLiveModuleSetupContext',
        identifiers: [
            'moduleDefinition',
            'container',
            'access',
            'activeContext',
            'nextModuleRegistrationIndex',
            'nextPrivateCollectionOrdinal',
            'nextPrivateDependencySelectorIndex',
            'privateCollections',
            'privateDependencySelectorIndexes'
        ]
    }
}

function isDecision(node) {
    if (
        ts.isIfStatement(node) ||
        ts.isConditionalExpression(node) ||
        ts.isForStatement(node) ||
        ts.isForInStatement(node) ||
        ts.isForOfStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isDoStatement(node) ||
        ts.isCaseClause(node) ||
        ts.isCatchClause(node)
    ) {
        return true
    }

    return (
        ts.isBinaryExpression(node) &&
        [
            ts.SyntaxKind.AmpersandAmpersandToken,
            ts.SyntaxKind.BarBarToken,
            ts.SyntaxKind.QuestionQuestionToken
        ].includes(node.operatorToken.kind)
    )
}

function getFunctionName(node) {
    if (node.name !== undefined && ts.isIdentifier(node.name)) {
        return node.name.text
    }

    const parent = node.parent

    if (parent !== undefined && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
        return parent.name.text
    }

    return '<anonymous>'
}

function analyze(path) {
    const text = fs.readFileSync(path, 'utf8')
    const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)
    const functions = []
    const functionNodes = []
    const importedModules = sourceFile.statements
        .filter((statement) => ts.isImportDeclaration(statement))
        .map((statement) => statement.moduleSpecifier.text)
    let decisionSites = 0
    let functionLikeNodes = 0

    function visit(node) {
        if (isDecision(node)) {
            decisionSites += 1
        }

        if (ts.isFunctionLike(node) && node.body !== undefined) {
            functionLikeNodes += 1
            functionNodes.push(node)
            const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
            const endLine = sourceFile.getLineAndCharacterOfPosition(node.end).line + 1
            let subtreeDecisionSites = 0
            let nestedFunctions = 0

            function visitFunctionSubtree(child) {
                if (child !== node && ts.isFunctionLike(child) && child.body !== undefined) {
                    nestedFunctions += 1
                }

                if (isDecision(child)) {
                    subtreeDecisionSites += 1
                }

                ts.forEachChild(child, visitFunctionSubtree)
            }

            visitFunctionSubtree(node.body)
            functions.push({
                name: getFunctionName(node),
                startLine,
                endLine,
                lines: endLine - startLine + 1,
                parameters: node.parameters.length,
                subtreeDecisionSites,
                nestedFunctions
            })
        }

        ts.forEachChild(node, visit)
    }

    visit(sourceFile)

    const profile = couplingProfiles[path.replaceAll('\\', '/').split('/').at(-1)]
    let trackedSharedStateCoupling

    if (profile !== undefined) {
        const target = functionNodes.find((node) => getFunctionName(node) === profile.functionName)

        if (target !== undefined) {
            const targetStart = target.getStart(sourceFile)
            const targetEnd = target.end
            const bodies = functionNodes.filter((node) => {
                return node.getStart(sourceFile) >= targetStart && node.end <= targetEnd
            })
            const referencesByIdentifier = Object.fromEntries(
                profile.identifiers.map((identifier) => [identifier, 0])
            )
            let coupledFunctionBodies = 0

            for (const body of bodies) {
                const references = new Set()

                function visitDirect(child) {
                    if (child !== body.body && ts.isFunctionLike(child) && child.body !== undefined) {
                        return
                    }

                    if (ts.isIdentifier(child) && profile.identifiers.includes(child.text)) {
                        references.add(child.text)
                    }

                    ts.forEachChild(child, visitDirect)
                }

                visitDirect(body.body)

                if (references.size !== 0) {
                    coupledFunctionBodies += 1
                }

                for (const identifier of references) {
                    referencesByIdentifier[identifier] += 1
                }
            }

            trackedSharedStateCoupling = {
                functionName: profile.functionName,
                trackedIdentifiers: profile.identifiers,
                functionBodiesInSubtree: bodies.length,
                coupledFunctionBodies,
                referencesByIdentifier
            }
        }
    }

    return {
        path,
        sha256: crypto.createHash('sha256').update(text).digest('hex'),
        lines: text.trimEnd().split(/\r?\n/).length,
        decisionSites,
        functionLikeNodes,
        importedModules: [...new Set(importedModules)].sort(),
        importFanOut: new Set(importedModules).size,
        trackedSharedStateCoupling,
        largestFunctions: functions.sort((left, right) => right.lines - left.lines).slice(0, 12)
    }
}

console.log(JSON.stringify(process.argv.slice(2).map(analyze), null, 2))
