import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(scriptDirectory, '..')

const examples = [
    {
        name: 'basic-node',
        tsconfig: 'examples/basic-node/tsconfig.run.json',
        run: '.tmp/examples/basic-node/main.js'
    },
    {
        name: 'module-composition',
        tsconfig: 'examples/module-composition/tsconfig.run.json',
        run: '.tmp/examples/module-composition/main.js'
    },
    {
        name: 'async-db-resource',
        tsconfig: 'examples/async-db-resource/tsconfig.run.json',
        run: '.tmp/examples/async-db-resource/main.js'
    },
    {
        name: 'testing-overrides',
        tsconfig: 'examples/testing-overrides/tsconfig.run.json',
        run: '.tmp/examples/testing-overrides/main.js'
    },
    {
        name: 'next-app-router',
        tsconfig: 'examples/next-app-router/tsconfig.run.json',
        run: '.tmp/examples/next-app-router/src/main.js'
    }
]

for (const example of examples) {
    run('tsc', ['-p', path.join(workspaceRoot, example.tsconfig), '--pretty', 'false'])
    run('node', [path.join(workspaceRoot, example.run)])

    console.log(`Validated ${example.name} example direct run.`)
}

console.log('Example validation passed.')

function run(command, args) {
    console.log(`> ${command} ${args.join(' ')}`)
    execFileSync(resolveBinary(command), resolveArguments(command, args), {
        cwd: workspaceRoot,
        stdio: 'inherit'
    })
}

function resolveBinary(command) {
    if (process.platform === 'win32' && command === 'tsc') {
        return 'cmd.exe'
    }

    if (command === 'tsc') {
        return path.join(workspaceRoot, 'node_modules', '.bin', 'tsc')
    }

    return command
}

function resolveArguments(command, args) {
    if (process.platform === 'win32' && command === 'tsc') {
        return [
            '/d',
            '/s',
            '/c',
            path.join(workspaceRoot, 'node_modules', '.bin', 'tsc.cmd'),
            ...args
        ]
    }

    return args
}
