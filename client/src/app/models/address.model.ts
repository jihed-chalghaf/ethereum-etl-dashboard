import {Country} from './country.model';

export class Address {
    id: number;
    street: string;
    city: string;
    postal_code: string;
    country: Country;
}