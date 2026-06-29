export type ResourceDisposer = () => void | Promise<void>

export interface Resource<TValue> {
    readonly value: TValue
    readonly dispose?: ResourceDisposer
}
