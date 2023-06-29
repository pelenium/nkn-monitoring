function sendIP() {
    var ip = String(document.getElementById("ip").value);
    var url = "/";
    console.log(ip);
    var arr = ip.split(" ");
    console.log(arr);
  
    function sendRequest(index) {
      if (index >= arr.length) {
        document.getElementById("ip").value = "";
        return;
      }
  
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
  
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          sendRequest(index + 1);
        }
      };
  
      var data = JSON.stringify({
        ip: arr[index],
      });
      xhr.send(data);
    }
  
    sendRequest(0);
  }  