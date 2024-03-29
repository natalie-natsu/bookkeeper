import { Mongo } from 'meteor/mongo';

export const Accounts = new Mongo.Collection('accounts');
export const Differences = new Mongo.Collection('differences');
export const Journals = new Mongo.Collection('journals');
export const Writings = new Mongo.Collection('writings');

export const BalanceStatus = {
    ZERO: 'zero',
    CREDIT: 'credit',
    DEBIT: 'debit'
};

export const AccountNum = {
    BALANCE_SHEET: /^F?[1-5]/,
    INCOME_STATEMENT: /^F?[6-7]/,
    FISCAL: '^F'
};

Accounts.helpers({
    updateBalance() {
        if (Meteor.isServer) {
            const writings = Writings.find({
                accountNum: this.num
            }, {
                fields: {
                    debit: 1,
                    credit: 1
                }
            });

            const balance = parseFloat(writings.fetch().reduce((a, b) => a + b.credit - b.debit, 0).toFixed(2));
            Accounts.update(this._id, {
                $set: {
                    balance
                }
            });
        }
    },
    getBalanceStatus() {
        return this.balance === 0
            ? BalanceStatus.ZERO
            : this.balance > 0
                ? BalanceStatus.CREDIT
                : BalanceStatus.DEBIT;
    },
    getBalanceLabel() {
        const status = this.getBalanceStatus();

        return status === BalanceStatus.ZERO
            ? 'Soldé'
            : status === BalanceStatus.CREDIT
                ? `Créditeur de ${Math.abs(this.balance)} €`
                : `Débiteur de ${Math.abs(this.balance)} €`;
    }
});

Writings.helpers({
    isFiscal() {
        return !!this.originalWritingId;
    },
    getFile() {
        return !this.differenceId ? false : Differences.findOne(this.differenceId).fileNum;
    },
    getFilePath() {
        return `/files/${this.getFile()}.pdf`;
    }
});
