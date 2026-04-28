export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

 
  console.error('ERROR 💥:', err);


  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // stack: err.stack // Only show this in development mode!
  });
};