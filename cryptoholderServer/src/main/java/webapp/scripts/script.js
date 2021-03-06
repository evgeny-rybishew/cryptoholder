

(function () {

    var doc = document,
        main = doc.querySelector('.main'),


        addButton = doc.querySelector('.plus'),
        addressInput = doc.querySelector('.newAddress'),
        statistic = doc.querySelector('.statisticEmpty'),
        refreshStatistic;



    window.onload = function(){

        if(localStorage.currencyInfo === undefined){
            localStorage.currencyInfo = "";
        }

        if(localStorage.statisticInfo === undefined){
            localStorage.statisticInfo = "";
            return;
        }

        main.innerHTML = localStorage.currencyInfo;

        statistic.innerHTML = localStorage.statisticInfo;

        refreshAll();
        addLisenerForButton();

        refreshStatistic = document.querySelector('.refreshStatistic');
        refreshStatistic.addEventListener('click', refreshAll);

    };







    var itBtc = function(address){
        if(address.length === 34 && Number(address[0])){
            return true;
        }
        return false;
    };


    var itEth = function(address){
        if(address.length === 42){
            return true;
        }
        return false;
    };

    var itDash = function(address){
        if(address[0] === 'X'){
            return true;
        }
        return false;
    };

    var itLtc = function(adddress){
        if(adddress[0] === 'L'){
            return true;
        }
        else{
            return false;
        }
    };



    var whatCurrency = function(address){

        if(itBtc(address)){
            return "btc";
        }
        else if(itEth(address)){
            return "eth";
        }
        else if(itDash(address)){
            return "dash";
        }
        else if(itLtc(address)){
            return "ltc";
        }
        else{
            return false;
        }
    };




    var crateBlock = function (currency,balance, inDollar, number, walletName, change, changeColor) {

        var block = "<div class = 'block " + currency + "'>\n" +
            "            <div class = 'currencyLogo " + currency +"Logo'></div>\n" +
            "            <div class = 'info'>\n" +
            "                <span class='name'>"+ walletName +"</span><br class = \"br1\">\n" +
            "                <span class='number'>" + number +"</span>\n" +
            "            </div>\n" +
            "            <div class = 'money'>\n" +
            "                <span class = 'balanc'>" + balance.toString().substring(0, 7) + " "
                                                            + currency.toUpperCase() + "</span><br class=\"br2\">\n" +

            "                <span class ='dollar'>" + inDollar.toString().split('.')[0] + " " + " $</span><br class=\"br2\">\n" +
            "                <span class = '" + changeColor + "'>"+ change.substring(0,5) +"</span>\n" +
            "            </div>\n" +
            "\n" +
            "            <div class = 'refresh'></div>\n" +
            "        </div>"

        return block;
    };



    var statisticCreator = function(){

        var blockArray = document.querySelectorAll('.block'),

            counter = blockArray.length,

            money = document.querySelectorAll('.dollar');
            sum = 0;

        if(counter <= 1){
            return "";
        }


        for(var i = 0; i < counter; i++){
            sum += parseInt(money[i].innerHTML);
        }

        var block = " <span class = 'total'>Всего. Эквивалент в долларах США : " + sum +" $</span><br>\n" +
            "        <span class = 'wallets'>Всего кошельков : " + counter +"</span>\n" +
            "        <div class = 'refreshStatistic'>";

        statistic.setAttribute('class', 'statistic');
        return block;

    };




    var addNewBlock = function(){


        if(!addressInput.value){
            addressInput.setAttribute('placeholder', 'Ошибка! Введите адрес кошелька (BTC, ETH, DASH, LTC)');
            return;
        }

        var address = addressInput.value.split(" ")[0];

        var currency = whatCurrency(address);

        if(!currency){
            addressInput.value = "";
            addressInput.setAttribute('placeholder', 'Ошибка! Введите адрес кошелька (BTC, ETH, DASH, LTC)');
            return;
        }

        var walletName = addressInput.value.split(" ")[1];

        if(!walletName){
            walletName = currency.toUpperCase();
        }

        if(!walletName.length > 34){
            walletName = walletName.substring(0, 33);
        }

        var balanceObj = JSON.parse(httpGet("https://api.blockcypher.com/v1/" + currency + "/main/addrs/" + address));

        if(balanceObj.final_balance === undefined){
            addressInput.value = "";
            addressInput.setAttribute('placeholder', 'Ошибка! Неверный адрес кошелька (BTC, ETH, DASH, LTC)');
            return;
        }

        var balance = 0;

        if(currency !== 'eth'){
            balance = balanceObj.final_balance * 1e-8;
        }
        else{
            balance = balanceObj.final_balance * 1e-18;
        }

        var inDollarObj = JSON.parse(httpGet("https://api.cryptonator.com/api/ticker/" + currency +"-usd")),

            inDollar = inDollarObj.ticker.price * balance,

            change = inDollarObj.ticker.change,
            changeColor = "";

        if(change < 0){
            changeColor = "red";
        }
        else {
            changeColor = "green";
        }


        var block = crateBlock(currency, balance, inDollar, address, walletName, change, changeColor);
        main.innerHTML += block;

        localStorage.currencyInfo += block;

        statistic.innerHTML = statisticCreator();

        localStorage.statisticInfo = statistic.innerHTML;


        addressInput.value = "";
        addressInput.setAttribute('placeholder', 'Введите адрес кошелька (BTC, ETH, DASH, LTC)');
        addLisenerForButton();

        refreshStatistic = document.querySelector('.refreshStatistic');

        if(!refreshStatistic){
            return;
        }
        refreshStatistic.addEventListener('click', refreshAll);


    };



    var refreshData = function(target){

        var block;

        if(!target.target){
            block = target;
        }
        else{
            block = target.target.parentNode;
        }




        var currency = whatCurrency(block.querySelector('.number').innerHTML),
            address = block.querySelector('.number').innerHTML,
            name = block.querySelector(".name").innerHTML,

            balanceObj = JSON.parse(httpGet("https://api.blockcypher.com/v1/" + currency + "/main/addrs/" + address)),
            balance = 0;

        if(currency !== 'eth'){
            balance = balanceObj.final_balance * 1e-8;
        }
        else{
            balance = balanceObj.final_balance * 1e-18;
        };

        var inDollarObj = JSON.parse(httpGet("https://api.cryptonator.com/api/ticker/" + currency +"-usd")),

            inDollar = inDollarObj.ticker.price * balance,

            change = inDollarObj.ticker.change,
            changeColor = "";

        if(change < 0 ){
            changeColor = "red";
        }
        else {
            changeColor = "green";
        }

        var data ="             <div class = 'currencyLogo " + currency +"Logo'></div>\n" +
        "            <div class = 'info'>\n" +
        "                <span class='name'>"+ name +"</span><br class = \"br1\">\n" +
        "                <span class='number'>" + address +"</span>\n" +
        "            </div>\n" +
        "            <div class = 'money'>\n" +
        "                <span class = 'balanc'>" + balance.toString().substring(0, 7) + " "
        + currency.toUpperCase() + "</span><br class=\"br2\">\n" +

        "                <span class ='dollar'>" + inDollar.toString().split('.')[0] + " " + " $</span><br class=\"br2\">\n" +
        "                <span class = '" + changeColor + "'>"+ change.substring(0,5) +"</span>\n" +
        "            </div>\n" +
        "\n" +
        "            <div class = 'refresh'></div>\n";



        block.innerHTML = data;
        addLisenerForButton();
        refreshStatistic = document.querySelector('.refreshStatistic');

        if(!refreshStatistic){
            return;
        }
        refreshStatistic.addEventListener('click', refreshAll);

    };



    var refreshAll = function(){

        var blocks = document.querySelectorAll(".block");

        for(var i = 0; i < blocks.length; i++){
            refreshData(blocks[i]);
        }

        statistic.innerHTML = statisticCreator();
        addLisenerForButton();

        refreshStatistic = document.querySelector('.refreshStatistic');

        if(!refreshStatistic){
            return;
        }
        refreshStatistic.addEventListener('click', refreshAll);


    };




    addButton.addEventListener('click', addNewBlock);




    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }


    function addLisenerForButton(){

        var buttons = document.querySelectorAll(".refresh");

        for(var i = 0; i < buttons.length; i++){
            buttons[i].addEventListener('click', refreshData);
        }


    }










})();