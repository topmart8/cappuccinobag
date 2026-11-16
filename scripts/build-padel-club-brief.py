"""Build the public buyer selection and sample-review brief from existing site assets."""
from pathlib import Path
from html import escape
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/downloads/cappuccino-padel-club-sample-brief.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
FONT_ROOT = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("Brief", str(FONT_ROOT / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("BriefBold", str(FONT_ROOT / "DejaVuSans-Bold.ttf")))
W, H = A4
INK = colors.HexColor("#18352d")
MUTED = colors.HexColor("#5c6d61")
LINE = colors.HexColor("#d4decd")
PALE = colors.HexColor("#edf1e7")
BG = colors.HexColor("#f7f5ee")
c = canvas.Canvas(str(OUTPUT), pagesize=A4)
c.setTitle("Cappuccino Padel - Club & Tournament Selection and Sample Brief")
c.setAuthor("Cappuccino Bag")

def text(value, x, top, width, size=9, bold=False, colour=INK, leading=None):
    style = ParagraphStyle("body", fontName="BriefBold" if bold else "Brief", fontSize=size,
                           leading=leading or size * 1.45, textColor=colour)
    paragraph = Paragraph(value, style)
    _, height = paragraph.wrap(width, H)
    paragraph.drawOn(c, x, H - top - height)
    return height

def rule(top, x=36, width=W-72):
    c.setStrokeColor(LINE)
    c.line(x, H-top, x+width, H-top)

def image(path, x, top, width, height):
    # Compress embedded PDF copies only; original product assets remain unchanged.
    photo = Image.open(ROOT / "public" / path).convert("RGB")
    photo.thumbnail((800,800))
    embedded = BytesIO()
    photo.save(embedded, format="JPEG", quality=85, optimize=True)
    embedded.seek(0)
    c.drawImage(ImageReader(embedded), x, H-top-height, width, height,
                preserveAspectRatio=True, anchor="c", mask="auto")

def base(page, eyebrow, title, subtitle):
    c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
    text("CAPPUCCINO  /  PADEL PROGRAMMES",36,24,W-72,9,True)
    text(eyebrow,36,57,W-72,9,True, MUTED)
    text(title,36,78,W-72,24,True,leading=29)
    text(subtitle,36,116,W-72,9,colour=MUTED)
    rule(779)
    text("cappuccinobag.com  |  info@cappuccinobag.net  |  +86 139 2871 5568",36,792,W-72,7.5)
    text(f"Selection brief R1 - 16 Nov 2026  |  {page} / 3",36,809,W-72,7,colour=MUTED)

products = [
    ("S005", "Thermal-lined racket sleeve", "images/padel/original-court-series-2026/S005/S005-hero.webp",
     "Sample-photo reference; digital branding.",
     "900D exterior, silver reflective lining, front zip pocket and detachable strap.",
     "Check racket fit, lining laminate, logo and hardware. Finished-bag water resistance and thermal performance require testing.",
     "/padel-accessories/custom-padel-racket-sleeve"),
    ("S004", "Court essentials pouch", "images/padel/S004/S004-01-main.png",
     "Design concept; sample approval required.",
     "Develop around overgrips, keys and small essentials for club retail or member packs.",
     "Approve contents, pocket sizes, fabric, zipper and usable logo area. Contents are not included.",
     "/padel-accessories/custom-padel-organizer-pouch"),
    ("S003", "Separate shoe bag", "images/padel/S003/S003-01-main.png",
     "Design concept; sample approval required.",
     "Dedicated footwear storage with proposed wide zip opening, carry handle and ventilation.",
     "Test the target shoe size, opening, lining and ventilation method. No odour-control performance is claimed.",
     "/padel-accessories/custom-ventilated-padel-shoe-bag"),
    ("PDB016", "Match-day team duffel", "images/padel/original-court-series-2026/PDB016/PDB016-hero.webp",
     "AI design concept; sample approval required.",
     "Proposed main bag with wide access, a racket sleeve and a separate footwear zone.",
     "Fit racket, shoes and clothing together. Approve dimensions, dividers, carrying comfort and loaded performance.",
     "/products/weekend-padel-carryall-pdb016"),
]

base(1,"01 / THE FIRST RANGE","Four formats. One club identity.",
     "Development references for private-label club, academy and tournament programmes.")
card_w = (W-86)/2
for i, (sku,name,img,status,description,check,url) in enumerate(products):
    x = 36+(i%2)*(card_w+14); top=151+(i//2)*301
    c.setFillColor(colors.white);c.roundRect(x,H-top-287,card_w,287,8,fill=1,stroke=0)
    image(img,x+8,top+8,card_w-16,119)
    text(sku,x+13,top+135,card_w-26,8,True,MUTED)
    text(name,x+13,top+151,card_w-26,11,True)
    text(status,x+13,top+170,card_w-26,6.7,colour=MUTED)
    text(description,x+13,top+192,card_w-26,8)
    text("SAMPLE CHECK: "+check,x+13,top+232,card_w-26,7.3)
    c.linkURL("https://www.cappuccinobag.com"+url,(x,H-top-287,x+card_w,H-top),relative=0,thickness=0)
text("Click a product card to view its full interior and detail gallery. New custom MOQ: 300 pieces per style.",36,756,W-72,8,True)
c.showPage()

base(2,"02 / CHOOSE THE PROGRAMME","Plan quantities by style.",
     "The examples below illustrate quantities only. They are not prices, stock offers or delivery promises.")
programmes = [
    ("CLUB SHOP COLLECTION","S005 sleeve + S004 pouch + S003 shoe bag", "Example: 300 pieces of each style = 900 separate retail items.", "Provide target retail positioning, colours, hangtags and replenishment needs."),
    ("MEMBER / ACADEMY KIT","S005 sleeve + S004 pouch", "Example: 300 sleeves + 300 pouches can make 300 two-item kits, if assembly is agreed.", "Provide member count, contents list, packaging and required arrival date."),
    ("TOURNAMENT / SPONSOR PACK","S004 pouch + optional S003 shoe bag / PDB016 duffel", "Example: 600 pouches + 300 shoe bags; allocate pack tiers separately.", "Provide quantities by tier, authorised sponsor artwork, event date and delivery destination."),
]
for i,(heading,items,example,brief) in enumerate(programmes):
    top=153+i*129
    c.setFillColor(PALE);c.roundRect(36,H-top-114,W-72,114,7,fill=1,stroke=0)
    text(heading,50,top+12,W-100,9,True)
    text(items,50,top+32,W-100,11,True)
    text(example,50,top+55,W-100,9)
    text(brief,50,top+84,W-100,8,colour=MUTED)
text("Quantities and scope",36,555,W-72,16,True)
for n, item in enumerate([
    "Minimum 300 pieces per style. Different styles cannot be combined to meet one minimum.",
    "Colour splits, special materials, sample scope and packaging are assessed separately.",
    "Rackets, balls, grips, towels and apparel are not included; separate sourcing and qualification are required.",
    "Approve arrival timing against sampling, materials, production, inspection and shipping before committing to an event."
]):
    text(f"{n+1}. {item}",36,587+n*35,W-72,9)
text("Build your brief online",36,738,W-72,10,True)
text("www.cappuccinobag.com/padel-club-tournament-supply",36,757,W-72,8)
c.linkURL("https://www.cappuccinobag.com/padel-club-tournament-supply#range-builder",(36,H-773,W-36,H-735),relative=0,thickness=0)
c.showPage()

base(3,"03 / SAMPLE AND QUOTATION WORKSHEET","Confirm before sampling.",
     "Use this checklist with your reference images. It is a development brief, not an approved production specification.")
fields=[("Club / event / brand", "Programme and chosen SKUs"), ("Quantity per style / colour", "Destination / required arrival date"), ("Target budget / currency / basis", "Contents / pack levels / assembly")]
for i,pair in enumerate(fields):
    top=154+i*59
    for j,label in enumerate(pair):
        x=36+j*(card_w+14)
        text(label,x,top,card_w,8,True)
        rule(top+36,x,card_w)
text("Sample review - four decisions for each style",36,345,W-72,15,True)
checks=[
 ("01  SIZE & CONTENTS", "Measure the actual racket, shoes and accessories. Agree external and usable internal dimensions, openings and packing layout. Do not infer measurements from concept images."),
 ("02  MATERIAL & LINING", "S005: review the 900D swatch, slate-grey/blue colour, subtle sheen and silver lining. Other styles: choose the exterior, lining and reinforcement. White EPE in S005 photos is removable shipping packaging only."),
 ("03  ARTWORK & HARDWARE", "Supply authorised vector artwork. Confirm logo width, position, colour and application on a physical swatch. Approve zipper, pulls, clips, strap and label placement."),
 ("04  PACKING & QUALITY", "Check loaded fit, carrying comfort, seams and closures. Agree any water, thermal or ventilation tests separately. Approve unit packing, kit assembly, carton marks and the retained sample version."),
]
for i,(heading,body) in enumerate(checks):
    top=378+i*76
    text(heading,36,top,W-72,9,True)
    text(body,36,top+20,W-72,8.4)
rule(696)
text("Quotation should separate",36,712,W-72,11,True)
text("Unit price by style and agreed quantity; sample/development charges; logo tooling; packaging and assembly; inspection or testing; freight and trade terms. All amounts and timings require confirmation.",36,734,W-72,8.3)
c.save()
print(OUTPUT)
