/**
 * A type akin to the builtin 'Partial' type, but requiring that at least one property from the specified type be set.
 *
 * <a href="https://stackoverflow.com/a/48244432">Credit to jcalz on StackOverflow</a>
 */
export type SemiPartial<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

// TODO [10/27/21 @ 3:18 PM] Currently, there exists an issue in which the following is permissible, even though it
//                           should not be. This is due to the fact that 'age' is allowed to be undefined.
//                           let a: SemiPartial<{ name: string, age?: number }> = {};
