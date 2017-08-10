import { Sa.MeFePage } from './app.po';

describe('sa.me-fe App', () => {
  let page: Sa.MeFePage;

  beforeEach(() => {
    page = new Sa.MeFePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
