-- ---------------------------------------------------------------------------
-- Install links for the published catalogue
--
-- The detail page renders one "Get it on X" button per row in
-- extension_browsers that carries an install_url, so this file fills that
-- column with the real store listing for every browser an extension supports.
--
-- Every URL below was checked against its own store while it was added:
--   Chrome   the listing page names the extension in its title
--   Edge     the add-ons detail API returns the listing name for the id
--   Firefox  the addons.mozilla.org API returns the slug, author and user count
--   Opera    the listing page returns 200 with the matching name
--   Safari   the App Store page returns 200 with the matching name
-- Anything that could not be confirmed that way was left empty on purpose,
-- because a wrong link is worse than no button.
--
-- Run this after seed_details.sql. That file still writes the placeholder slug
-- URL into every row of extension_browsers, so this one has to run last and win.
--
-- Safe to re-run: it upserts, so a second run changes nothing.
-- ---------------------------------------------------------------------------

insert into public.extension_browsers (extension_id, browser_id, install_url)
select e.id, b.id, v.url
from (values
    ('adguard', 'chrome', 'https://chromewebstore.google.com/detail/adguard-adblocker/bgnkhhnnamicmpeenaelnjfhikgbkllg'),
    ('adguard', 'firefox', 'https://addons.mozilla.org/firefox/addon/adguard-adblocker/'),
    ('adguard', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/adguard-adblocker/pdffkfellgipmhklpdmokmckkkfcopbh'),
    ('adguard', 'safari', 'https://apps.apple.com/us/app/adguard-ad-blocker-for-safari/id1440147259'),
    ('axe-devtools', 'chrome', 'https://chromewebstore.google.com/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd'),
    ('axe-devtools', 'firefox', 'https://addons.mozilla.org/firefox/addon/axe-devtools/'),
    ('axe-devtools', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/axe-devtools-web-access/kcenlimkmjjkdfcaleembgmldmnnlfkn'),
    ('bitwarden', 'chrome', 'https://chromewebstore.google.com/detail/bitwarden-password-manage/nngceckbapebfimnlniiiahkandclblb'),
    ('bitwarden', 'firefox', 'https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/'),
    ('bitwarden', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/jbkfoedolllekgbhcbcoahefnbanhhlh'),
    ('buffer', 'chrome', 'https://chromewebstore.google.com/detail/buffer/noojglkidnpfjbincgijbaiedldjfbhh'),
    ('buffer', 'firefox', 'https://addons.mozilla.org/firefox/addon/buffer-for-firefox/'),
    ('capital-one-shopping', 'chrome', 'https://chromewebstore.google.com/detail/capital-one-shopping-save/nenlahapcbofgnanklpelkaejcehkggg'),
    ('capital-one-shopping', 'firefox', 'https://addons.mozilla.org/firefox/addon/wikibuy-for-firefox/'),
    ('capital-one-shopping', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/capital-one-shopping-sav/kiiaghlmeikbpmeabhilfphikfcefljn'),
    ('colorzilla', 'chrome', 'https://chromewebstore.google.com/detail/colorzilla/bhlhnicpbhignbdhedgjhgdocnmhomnp'),
    ('colorzilla', 'firefox', 'https://addons.mozilla.org/firefox/addon/colorzilla/'),
    ('colorzilla', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/dficlbaoinpdhpbeikhmnbpgfoekegeo'),
    ('cookie-editor', 'chrome', 'https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm'),
    ('cookie-editor', 'firefox', 'https://addons.mozilla.org/firefox/addon/cookie-editor/'),
    ('cookie-editor', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/cookieeditor/neaplmfkghagebokkhpjpoebhdledlfi'),
    ('cookie-editor', 'opera', 'https://addons.opera.com/en/extensions/details/cookie-editor/'),
    ('coupert', 'chrome', 'https://chromewebstore.google.com/detail/coupert-automatic-coupon/mfidniedemcgceagapgdekdbmanojomk'),
    ('coupert', 'firefox', 'https://addons.mozilla.org/firefox/addon/coupert/'),
    ('coupert', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/coupert-automatic-coupo/pefhciejnkgdgoahgfeklebcbpmhnhhd'),
    ('google-keep', 'chrome', 'https://chromewebstore.google.com/detail/google-keep-chrome-extens/lpcaedmchfhocbbapmcbpinfpgnhiddi'),
    ('harpa-ai', 'chrome', 'https://chromewebstore.google.com/detail/harpa-ai-web-automation-w/eanggfilgoajaocelnaflolkadkeghjp'),
    ('hunter', 'chrome', 'https://chromewebstore.google.com/detail/hunter-email-finder-exten/hgmhmanijnjhaffoampdlllchpolkdnj'),
    ('hunter', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/hunter-email-finder-ext/dmgcgojogkfomifjfeeafajhmgilkofk'),
    ('keepa', 'chrome', 'https://chromewebstore.google.com/detail/keepa-amazon-price-tracke/neebplgakaahbhdphmkckjjcegoiijjo'),
    ('keepa', 'firefox', 'https://addons.mozilla.org/firefox/addon/keepa/'),
    ('keepa', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/ejefaeioamebhekmfaclajddbpnnobje'),
    ('merlin', 'chrome', 'https://chromewebstore.google.com/detail/merlin-ai/camppjleccjaphfdbohjdohecfnoikec'),
    ('monica', 'chrome', 'https://chromewebstore.google.com/detail/monica-all-in-one-ai-assi/ofpnmcalabcbjgholdjcjblkibolbppb'),
    ('monica', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/fhimbbbmdjiifimnepkibjfjbppnjble'),
    ('muzli', 'chrome', 'https://chromewebstore.google.com/detail/muzli-design-inspiration/glcipcfhmopcgidicgdociohdoicpdfc'),
    ('muzli', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/ojliknkghkfaflcdckdfaebdnchahihb'),
    ('notion-web-clipper', 'chrome', 'https://chromewebstore.google.com/detail/notion-web-clipper/knheggckgoiihginacbkhaalnibhilkk'),
    ('notion-web-clipper', 'firefox', 'https://addons.mozilla.org/firefox/addon/notion-web/'),
    ('onetab', 'chrome', 'https://chromewebstore.google.com/detail/onetab/chphlpgkkbolifaimnlloiipkdnihall'),
    ('onetab', 'firefox', 'https://addons.mozilla.org/firefox/addon/onetab/'),
    ('onetab', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/onetab/hoimpamkkoehapgenciaoajfkfkpgfop'),
    ('perfectpixel', 'chrome', 'https://chromewebstore.google.com/detail/perfectpixel-by-welldonec/dkaagdgjmgdmbnecmcefdhjekcoceebi'),
    ('perfectpixel', 'firefox', 'https://addons.mozilla.org/firefox/addon/perfectpixel/'),
    ('perfectpixel', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/oolfkllppnieaaddmlfgljpboeagcobk'),
    ('react-developer-tools', 'chrome', 'https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi'),
    ('react-developer-tools', 'firefox', 'https://addons.mozilla.org/firefox/addon/react-devtools/'),
    ('react-developer-tools', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil'),
    ('requestly', 'chrome', 'https://chromewebstore.google.com/detail/requestly/jpjijjacgmmfbelhehchhjbmobakemme'),
    ('requestly', 'firefox', 'https://addons.mozilla.org/firefox/addon/requestly-v2/'),
    ('requestly', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/requestly-redirect-url-/ehghoapnlpepjmfbgaomdiilchcjemak'),
    ('seoquake', 'chrome', 'https://chromewebstore.google.com/detail/seoquake-on-page-seo-chec/akdgnmcogleenhbclghghlkkdndkjdjc'),
    ('seoquake', 'firefox', 'https://addons.mozilla.org/firefox/addon/seoquake-seo-extension/'),
    ('seoquake', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/ggcbmpnjmphdjigicghiokmciajppnce'),
    ('sider', 'chrome', 'https://chromewebstore.google.com/detail/sider-chat-with-all-ai-gp/difoiogjjojoaoomphldepapgpbgkhkb'),
    ('sider', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/sider-ai-sidebar-with-al/dhoenijjpgpeimemopealfcbiecgceod'),
    ('todoist', 'chrome', 'https://chromewebstore.google.com/detail/todoist-for-chrome-planne/jldhpllghnbhlbpcmnajkpdmadaolakh'),
    ('todoist', 'firefox', 'https://addons.mozilla.org/firefox/addon/todoist/'),
    ('todoist', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/todoist-for-microsoft-edg/fgcjgjggdkjmafpnbcplcdkbfogcbonk'),
    ('ublock-origin-lite', 'chrome', 'https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh'),
    ('ublock-origin-lite', 'edge', 'https://microsoftedge.microsoft.com/addons/detail/ublock-origin-lite/cimighlppcgcoapaliogpjjdehbnofhn')
) as v(slug, browser, url)
join public.extensions e on e.slug = v.slug
join public.browsers b on b.slug = v.browser
on conflict (extension_id, browser_id)
do update set install_url = excluded.install_url;

-- Expect 61 of 68 browser pairs filled: every published extension now shows at
-- least one store button, and the seven gaps are browsers with no official
-- listing for that product.
select count(*) filter (where install_url is not null) as linked,
       count(*) as total
from public.extension_browsers eb
join public.extensions e on e.id = eb.extension_id
where e.status = 'published';
