import { MatriculacionesPage } from './app.po';

describe('matriculaciones App', function() {
  let page: MatriculacionesPage;

  beforeEach(() => {
    page = new MatriculacionesPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
