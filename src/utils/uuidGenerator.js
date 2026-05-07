import { v4 as uuidv4 } from 'uuid';

export const generateFileName = ()=>{
    const id = uuidv4();
    const fileName=`${Date.now()}-${id}.webp`;
    return fileName;

}
