import { Profile } from "./profile.model";
import { Subscription } from "./subscription.model";

export class User{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profile: Profile;
    role: string;
    subscription: Subscription;
    deleted: false;
}