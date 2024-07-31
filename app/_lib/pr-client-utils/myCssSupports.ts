
export function myCssSupports(property: string, value: string) {
    
    return typeof(CSS) === 'object' && CSS.supports && CSS.supports(property, value);
}
