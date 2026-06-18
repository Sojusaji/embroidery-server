import validator from 'validator';

export const identifyLoginInput = (identifier) => {
  if (!identifier || typeof identifier !== 'string' || identifier.length > 100) {
    return { type: 'invalid', value: null };
  }


  const cleanInput = identifier.trim().toLowerCase();


  if (validator.isEmail(cleanInput)) {
    return { type: 'email', value: cleanInput };
  }

 
  const normalizedMobile = cleanInput.replace(/[\s\-()]/g, '');


  if (validator.isMobilePhone(normalizedMobile, 'any')) {
    return { type: 'mobile', value: normalizedMobile };
  }

  return { type: 'invalid', value: cleanInput };
};