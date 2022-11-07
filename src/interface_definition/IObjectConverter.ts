interface IObjectConverter<TargetType> {
    toResult(json: unknown): TargetType;
    resultToJson(value: TargetType): unknown;
}

function staticImplements<T>(): <U extends T>(constructor: U) => void {
    return <U extends T>(constructor: U): void => { constructor; };
}

export function staticObjectConverter<TargetType>(): (constructor: IObjectConverter<TargetType>) => void {
    return staticImplements<IObjectConverter<TargetType>>();
}
