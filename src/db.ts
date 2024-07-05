import levelup from 'levelup';
import leveldown from 'leveldown';

export const db = levelup(leveldown('./db'));
