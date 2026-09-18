let productsByBarcode=new Map(), scanner=null, scanning=false, productsLoaded=false;
const $=id=>document.getElementById(id);
const scannerView=$('scannerView'),manualView=$('manualView'),resultView=$('resultView'),notFoundView=$('notFoundView');
async function loadProducts(){const r=await fetch('products.json',{cache:'no-store'});if(!r.ok)throw new Error('products');const data=await r.json();for(const p of data.products||[])productsByBarcode.set(String(p.barcode).trim(),p);productsLoaded=true;}
function money(v){if(v===null||v===undefined||v==='')return '—';const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)?n.toLocaleString('ar-IQ'):'—';}
function show(view){[scannerView,manualView,resultView,notFoundView].forEach(v=>v.hidden=true);view.hidden=false;window.scrollTo({top:0,behavior:'smooth'});}
function resetScannerUI(){$('startBtn').hidden=false;$('cameraMessage').hidden=false;$('cameraMessage').textContent='اضغط «استخدم الكاميرا» ثم اسمح للمتصفح باستخدام الكاميرا';}
function showProduct(p,scannedCode){$('productName').textContent=p.name||'بدون اسم';$('productPrice').textContent=money(p.price);$('productBarcode').textContent=scannedCode||p.barcode;if(p.image){$('productImage').src=p.image;$('productImage').hidden=false;$('imagePlaceholder').hidden=true;}else{$('productImage').hidden=true;$('imagePlaceholder').hidden=false;}show(resultView);}
function lookup(code){const c=String(code||'').trim();if(!c)return;const p=productsByBarcode.get(c);if(p)showProduct(p,c);else{$('notFoundCode').textContent=c;show(notFoundView);}}
function stopScanner(){if(scanner&&scanning){scanner.stop().catch(()=>{}).finally(()=>{scanning=false;});}else{scanning=false;}$('stopBtn')?.setAttribute('hidden','');}
function onScanSuccess(decodedText){const code=String(decodedText).trim();stopScanner();lookup(code);}
async function startScanner(){if(!productsLoaded)await loadProducts();if(typeof Html5Qrcode==='undefined'){$('cameraMessage').textContent='تعذر تحميل قارئ الكاميرا. تأكد من اتصال الإنترنت ثم أعد المحاولة.';return;}$('cameraMessage').hidden=true;$('startBtn').hidden=true;scanner=new Html5Qrcode('reader');try{await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:280,height:120}},onScanSuccess,()=>{});scanning=true;}catch(e){$('cameraMessage').hidden=false;$('cameraMessage').textContent='لم نستطع تشغيل الكاميرا. اسمح للمتصفح بالكاميرا وتأكد أن الموقع يعمل عبر HTTPS.';resetScannerUI();}}
$('startBtn').addEventListener('click',startScanner);
$('manualBtn').addEventListener('click',()=>show(manualView));
$('backFromManual').addEventListener('click',()=>{resetScannerUI();show(scannerView);});
$('manualForm').addEventListener('submit',e=>{e.preventDefault();lookup($('manualCode').value);});
$('scanAgainBtn').addEventListener('click',()=>{resetScannerUI();show(scannerView);});
$('retryBtn').addEventListener('click',()=>{resetScannerUI();show(scannerView);});
$('helpBtn').addEventListener('click',()=>$('helpDialog').showModal());
$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
loadProducts().catch(()=>{$('cameraMessage').textContent='تعذر تحميل بيانات الأسعار. تأكد من وجود ملف products.json.';});
