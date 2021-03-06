import Realm, { ObjectSchema } from 'realm';
import assign from 'lodash/assign';

import { ProfileSchema } from '@store/schemas/latest';

import BaseRepository from './base';

class ProfileRepository extends BaseRepository {
    realm: Realm;
    schema: ObjectSchema;

    initialize(realm: Realm) {
        this.realm = realm;
        this.schema = ProfileSchema.schema;
    }

    increaseIdempotency = () => {
        const profile = this.getProfile();
        this.safeWrite(() => {
            profile.idempotency += 1;
        });
    };

    saveProfile = (object: Partial<ProfileSchema>) => {
        const current = this.getProfile();
        if (current) {
            this.safeWrite(() => {
                assign(current, object);
            });
        } else {
            this.create(object);
        }
    };

    getProfile = (): ProfileSchema => {
        const profile = Array.from(this.findAll()) as ProfileSchema[];

        // get profile
        if (profile.length > 0) {
            return profile[0];
        }

        return undefined;
    };
}

export default new ProfileRepository();
