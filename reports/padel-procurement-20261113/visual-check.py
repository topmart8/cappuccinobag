import json
from playwright.sync_api import sync_playwright
paths=['/products/womens-lightweight-padel-tote-pdb014','/products/weekend-padel-carryall-pdb016','/products/travel-padel-utility-backpack-pdb017']
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [1440,360,390,430]:
  context=b.new_context(viewport={'width':width,'height':900})
  context.route('**/*',lambda route: route.continue_() if route.request.method in ['GET','HEAD'] and route.request.url.startswith('http://127.0.0.1:3101') else route.abort())
  page=context.new_page()
  for path in paths:
   response=page.goto('http://127.0.0.1:3101'+path,wait_until='networkidle',timeout=120000)
   assert response.status==200
   consent=page.get_by_role('button',name='Necessary only',exact=True)
   if consent.is_visible(): consent.click()
   page.get_by_role('heading',name='Material, logo and construction references').scroll_into_view_if_needed()
   overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth')
   assert not overflow
   for href in ['/blog/recycled-water-resistant-materials-padel-bags','/logo-customization-guide','/custom-padel-bag-manufacturer#padel-prototype-case']:
    assert page.locator('a[href="'+href+'"]').count()>0
   page.screenshot(path='reports/padel-procurement-20261113/'+path.split('-')[-1]+'-'+str(width)+'.png')
   interior=page.get_by_role('button',name='Interior',exact=False)
   if interior.count(): interior.first.click()
   quote=page.locator('.hybrid-product-hero a').filter(has_text='Request a Quote').first
   href=quote.get_attribute('href'); assert path.split('-')[-1].upper() in href
   page.goto('http://127.0.0.1:3101'+href,wait_until='networkidle')
   message=page.locator('[name="message"]').input_value()
   assert path.split('-')[-1].upper() in message
   results.append({'width':width,'path':path,'status':response.status,'overflow':overflow,'prefill':message})
  context.close()
 b.close()
open('reports/padel-procurement-20261113/browser.json','w').write(json.dumps(results,indent=2))
print(json.dumps(results))
