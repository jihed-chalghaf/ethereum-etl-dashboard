import { Address } from './address.model';

export class Profile {
    id: number;
    birthDate: Date;
    gender: string;
    imageUrl: string;
    phoneNumber: string;
    address: Address;
}