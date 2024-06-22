export const ensure = (condition: boolean): void => {
    if (!condition) {
        throw new Error('Condition is not met');
    }
}
