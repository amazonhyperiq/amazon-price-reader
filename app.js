let productsByBarcode=new Map(), scanner=null, scanning=false, productsLoaded=false;

const $=id=>document.getElementById(id);
const scannerView=$("scannerView"), resultView=$("resultView"), notFoundView=$("notFoundView");

async function loadProducts(){
  const r=await fetch("products.json",{cache:"no-store"});
  const data=await r.json();
  for(const p of data.products||[]) productsByBarcode.set(String(p.barcode),p);
  productsLoaded=true;
}

function money(v){
  if(v===null||v===undefined||v==="") return "—";
  const n=Number(String(v).replace(/,/g,""));
  return Number.isFinite(n)?n.toLocaleString("ar-IQ"):"—";
}

function show(view){
  scannerView.hidden=resultView.hidden=notFoundView.hidden=true;
  view.hidden=false;
}

function showProduct(p){
  $("productName").textContent=p.name||"بدون اسم";
  $("productPrice").textContent=money(p.price);
  $("productBarcode").textContent=p.barcode;
  if(p.image){
    $("productImage").src=p.image;
    $("productImage").hidden=false;
    $("imagePlaceholder").hidden=true;
  }else{
    $("productImage").hidden=true;
    $("imagePlaceholder").hidden=false;
  }
  show(resultView);
}

function stopScanner(){
  if(scanner && scanning){
    scanner.stop().catch(()=>{}).finally(()=>{scanning=false});
  }
  $("stopBtn").hidden=true;
}

function onScanSuccess(decodedText){
  const code=String(decodedText).trim();
  stopScanner();
  const p=productsByBarcode.get(code);
  if(p) showProduct(p);
  else{
    $("notFoundCode").textContent=code;
    show(notFoundView);
  }
}

async function startScanner(){
  if(!productsLoaded) await loadProducts();
  if(typeof Html5Qrcode==="undefined"){
    $("cameraMessage").textContent="تعذر تحميل قارئ الكاميرا. تأكد من اتصال الإنترنت ثم أعد المحاولة.";
    return;
  }
  $("cameraMessage").hidden=true;
  $("startBtn").hidden=true;
  $("stopBtn").hidden=false;
  scanner=new Html5Qrcode("reader");
  try{
    await scanner.start(
      {facingMode:"environment"},
      {fps:10,qrbox:{width:260,height:130}},
      onScanSuccess,
      ()=>{}
    );
    scanning=true;
  }catch(e){
    $("cameraMessage").hidden=false;
    $("cameraMessage").textContent="لم نستطع تشغيل الكاميرا. تأكد من السماح للمتصفح بالكاميرا وأن الصفحة تعمل عبر HTTPS.";
    $("startBtn").hidden=false;
    $("stopBtn").hidden=true;
  }
}

$("startBtn").addEventListener("click",startScanner);
$("stopBtn").addEventListener("click",()=>{stopScanner();$("startBtn").hidden=false;$("cameraMessage").hidden=false});
$("scanAgainBtn").addEventListener("click",()=>{show(scannerView);$("startBtn").hidden=false;$("cameraMessage").hidden=false});
$("retryBtn").addEventListener("click",()=>{show(scannerView);$("startBtn").hidden=false;$("cameraMessage").hidden=false});
$("helpBtn").addEventListener("click",()=>{$("helpDialog").showModal()});
$("closeHelp").addEventListener("click",()=>{$("helpDialog").close()});

loadProducts().catch(()=>{
  $("cameraMessage").textContent="تعذر تحميل بيانات الأسعار. تأكد من وجود ملف products.json.";
});
