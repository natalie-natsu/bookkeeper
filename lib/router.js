import { Accounts, Journals, Writings, AccountNum } from '/imports/api/collections';

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

Router.route('/accounts', {
    name: 'accountList',
    template: 'accountList'
});

Router.route('/fiscal-accounts', {
    name: 'fiscalAccountList',
    template: 'fiscalAccountList',
    data: function () {
        if (this.ready()) {
            return {
                selector: {
                    num: {'$regex': AccountNum.FISCAL, '$options': 'i'}
                }
            };
        }
    }
});

Router.route('/account/:num', {
    name: 'accountRead',
    template: 'accountRead',
    onBeforeAction: function () {
        const account = Accounts.findOne({
            num: this.params.num
        });

        if (account) this.next();
        else this.render('notFound');
    },
    waitOn: function () {
        return [
            Meteor.subscribe('account.read', this.params.num)
        ];
    },
    data: function () {
        if (this.ready()) {
            return {
                account: Accounts.findOne({
                    num: this.params.num
                }),
                selector: {
                    accountNum: this.params.num
                }
            };
        }
    }
});

Router.route('/', {
    name: 'home',
    onBeforeAction: function () {
        Router.go('stepper', {step: '1'});
    }
});

Router.route('/divergent-writings', {
    name: 'divergentWritingList',
    template: 'divergentWritingList'
});

Router.route('/journals', {
    name: 'journalList',
    template: 'journalList'
});

Router.route('/journal/:code', {
    name: 'journalRead',
    template: 'journalRead',
    onBeforeAction: function () {
        const journal = Journals.findOne({
            code: this.params.code
        });

        if (journal) this.next();
        else this.render('notFound');
    },
    waitOn: function () {
        return [
            Meteor.subscribe('journal.read', this.params.code)
        ];
    },
    data: function () {
        if (this.ready()) {
            return {
                journal: Journals.findOne({
                    code: this.params.code
                }),
                writings: Writings.find({
                    journalCode: this.params.code
                }, {
                    sort: {
                        date: 1,
                        accountName: 1,
                        num: 1
                    }
                }).fetch()
            };
        }
    }
});

Router.route('/writings/import', {
    name: 'writingsImport',
    template: 'writingsImport',
    data: {}
});

Router.route('/writings', {
    name: 'writingList',
    template: 'writingList'
});

Router.route('/balance-sheet/:mode?', {
    name: 'balanceSheetRead',
    template: 'balanceSheetRead',
    onBeforeAction: function () {
        const mode = this.params.mode;

        if (!mode || mode === 'fiscal') this.next();
        else this.render('notFound');
    },
    data: function () {
        if (this.ready()) {
            return {
                fiscal: this.params.mode === 'fiscal'
            };
        }
    }
});

Router.route('/income-statement/:mode?', {
    name: 'incomeStatementRead',
    template: 'incomeStatementRead',
    onBeforeAction: function () {
        const mode = this.params.mode;

        if (!mode || mode === 'fiscal') this.next();
        else this.render('notFound');
    },
    data: function () {
        if (this.ready()) {
            return {
                fiscal: this.params.mode === 'fiscal'
            };
        }
    }
});

Router.route('/writing/create', {
    name: 'writingCreate',
    template: 'writingCreate'
});

Router.route('/stepper/:step?', {
    name: 'stepper',
    template: 'stepper',
    onBeforeAction: function () {
        const step = parseInt(this.params.step);
        if (!step || step < 1 || step > 4) {
            Router.go('stepper', {step: '1'});
        }

        this.next();
    },
    data: function () {
        if (this.ready()) {
            return {
                step: this.params.step || '1'
            };
        }
    }
});
