import { BudizPage } from './app.po';

describe('budiz App', () => {
  let page: BudizPage;

  beforeEach(() => {
    page = new BudizPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
