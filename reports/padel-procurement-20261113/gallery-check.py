from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844})
 page.route('**/*',lambda r:r.continue_() if r.request.method=='GET' and r.request.url.startswith('http://127.0.0.1:3101') else r.abort())
 for slug in ['womens-lightweight-padel-tote-pdb014','weekend-padel-carryall-pdb016','travel-padel-utility-backpack-pdb017']:
  page.goto('http://127.0.0.1:3101/products/'+slug,wait_until='networkidle')
  consent=page.get_by_role('button',name='Necessary only',exact=True)
  if consent.is_visible():consent.click()
  button=page.get_by_role('button',name='Show interior',exact=True); button.click()
  assert button.get_attribute('aria-pressed')=='true'
  assert '-interior.' in page.get_by_role('link',name='Open full-size photo').get_attribute('href')
  print(slug, 'interior control PASS')
 b.close()
