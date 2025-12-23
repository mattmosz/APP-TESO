import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar que el usuario NO sea padre (solo admin/tesorera)
export const adminOnly = (req, res, next) => {
  if (req.user.rol === 'padre') {
    return res.status(403).json({ error: 'Acceso denegado. No tienes permisos para esta acción.' });
  }
  next();
};
