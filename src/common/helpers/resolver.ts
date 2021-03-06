import { memoize, isEmpty } from 'lodash';

import { ContactRepository, AccountRepository } from '@store/repositories';

import { BackendService } from '@services';

export interface AccountInfo {
    name: string;
    source: string;
}

const getAccountInfo = memoize(
    (address: string): Promise<AccountInfo> => {
        return new Promise(resolve => {
            // check address  book
            const contact = ContactRepository.findOne({ address });
            if (!isEmpty(contact)) {
                return resolve({
                    name: contact.name,
                    source: 'internal:contacts',
                });
            }

            // check in accounts list
            const account = AccountRepository.findOne({ address });
            if (!isEmpty(account)) {
                return resolve({
                    name: account.label,
                    source: 'internal:accounts',
                });
            }

            // check the backend
            return BackendService.getAddressInfo(address)
                .then((res: any) => {
                    if (!isEmpty(res)) {
                        return resolve({
                            name: res.name,
                            source: res.source,
                        });
                    }
                    return resolve({
                        name: '',
                        source: '',
                    });
                })
                .catch(() => {
                    return resolve({
                        name: '',
                        source: '',
                    });
                });
        });
    },
);

export { getAccountInfo };
