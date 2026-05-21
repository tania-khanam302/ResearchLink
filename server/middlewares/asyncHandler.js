// export const asyncHandler = (theFunction) => (req, res, next) => {
//     Promise.resolve(theFunction(req, res, next)).catch(next);   // theFunction is the function we want to execute, and if it returns a promise that rejects, we catch the error and pass it to the next middleware (which is usually the error handling middleware).
// }

export const asyncHandler = (theFunction) => (req, res, next) => {
  Promise.resolve(theFunction(req, res, next)).catch(next);
}