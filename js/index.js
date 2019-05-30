
var stopCar = {
    uTime:1000, //基础更新时间
    //Header update Time
    updateTime:function(){
        var $time = $("#header .time");
        var $date = $("#header .date");
        var flag = false;
        updateTime();
        var i=0;
        function updateTime(){
            var date = new Date();
            if(!flag){
                var nowDate = date.getFullYear() + "年" + (date.getMonth()+1<10? '0'+(date.getMonth()+1):(date.getMonth()+1))+"月"+(date.getDate()<10?'0'+date.getDate():date.getDate())+"日";
                $date.html(nowDate);
                flag = true;
            }
            var h = date.getHours();
            var m = date.getMinutes();
            var s = date.getSeconds();
            if(m==0&&h==0&&s==0){
                flag = false;
            }
            var nowTime = [h<10?'0'+h:h,m<10?'0'+m:m,s<10?'0'+s:s].join(':');
            $time.html(nowTime);
            console.log("执行了",i++)
        }
        var t = setInterval(updateTime,3000);
        return this;
    },
    //今日收入
    todayIncome:function(){
        var $moneyLeft = $('.money-left');
        var $moneyRatioImg = $(".money-right img");
        var $moneyRatio = $(".money-right .ratio");
        getData();
        setInterval(getData,this.uTime);
        function getData(){
            $.ajax({
                url:config['mon_number'],
                success:function(data){
                    if(data.code==1){
                        render(data)
                    }else{
                        render({data:{t_number:0,ratio:1}})
                    }
                },
                error:function(){
                    render({data:{t_number:0,ratio:1}})
                }
            })
        }
        function render(data){
            $moneyLeft.html(data.data['t_number']);
            if(data.data['ratio']>0){
                $moneyRatioImg.attr('src','images/up.png');
            }else{
                $moneyRatioImg.attr('src','images/down.png');
            }
            $moneyRatio.html(data.data['ratio']);
        }
    },
    //停车时长
    stopLength:function(){
        var resetData = [{"name":"30分钟以内","total":999,"ratio":1},{"name":"30-60分钟","total":999,"ratio":1},{"name":"1-2小时","total":999,"ratio":1},{"name":"2-4小时","total":999,"ratio":1},{"name":"4小时以上","total":999,"ratio":1}]
        function getData(data){
            var d = [];
            for(let i=0;i<data.length;i++){
                d.push({name:data[i].name,value:data[i].total})
            }
            return d;
        }
        
        var $stopLengthPip= $(".stop-lenth .pip");
        var myChart = echarts.init($stopLengthPip[0]);
        var option = {
            color:['#fbff86','#ff6f6f','#ab6eff','#1dd7ff','#7dff89'],
            tooltip: {
                trigger: 'item',
                formatter: "<div>时长：{b}</div> <div>总计：{c} </div><div>占比：{d}%</div>"
            },
            series: [
                {
                    name:'当前停车时长比例',
                    type:'pie',
                    radius: ['50%', '70%'],
                    label: {
                        show:true,
                        position: 'outside',
                        fontSize:12
                    },
                    labelLine: {
                        show: true
                    },
                    data:getData(resetData)
                }
            ]
        }
        if(option){
            myChart.setOption(option, true);
        }

        setInterval(render,10000)
        render();
        function render(){
            $.ajax({
                url:config.current_ratio,
                success:function(data){
                    // console.log(data)
                    if(data.code==1){
                        option.series[0].data = getData(data.data);
                    }else{
                        option.series[0].data = resetData;
                    }
                    myChart.setOption(option, true);
                },
                error:function(){
                    option.series[0].data = resetData;
                    myChart.setOption(option, true);
                }
            })
        }
        return this;
    },
    //设备警告
    deviceWarning:function(){
        var $deviceList = $(".device-list");
        var $deviceListBox = $('.device-list-box');
        //自动滚动
        setInterval(getData,10000);
        getData();
        function getData(){
            $.ajax({
                url:config['device_error'],
                success:function(data){
                    // console.log(data)
                    if(data.code==1){
                        render(data.data);
                    }else{
                        render([]);
                    }
                },
                error:function(){
                    render([]);
                }
            })
        }
        function render(data){
            var str = "";
            for(var i=0;i<data.length;i++){
                str+= `<li class="device-item ${data[i].status?'success':'error'}">
                    <div class="top">
                        <div class="person">
                            <span>${data[i].status_name}</span>
                            <span>巡逻人员：${data[i].patrol_name}</span>
                        </div>
                        <div class="time">${data[i].time}</div>
                    </div>
                    <div class="info">
                        <div class="pos">${data[i].park_name}</div>
                        <div class="error">${data[i].error}</div>
                    </div>
                </li>`;
            }
            $deviceListBox.html(str);
        }
       $(window).load(function(){
            
            var deviceListHeight = $deviceList.height();
            var deviceListBoxHeight = $deviceListBox.height();
            // console.log(deviceListBoxHeight)
            var top = 0;
            var deviceT = setInterval(slideMove,100)

            function slideMove(){
                
                top--;
                if(deviceListBoxHeight<deviceListHeight){
                    clearInterval(deviceT);
                }
                if(Math.abs(top)>(deviceListBoxHeight-deviceListHeight)){
                    top = 0;
                }
                $deviceListBox.css({
                    top:top+'px'
                })
            }
            $deviceList.hover(function(){
                clearInterval(deviceT);
            },function(){
                deviceT = setInterval(slideMove,100)
            })
       })
       return this;
    },
    //昨日运营情况
    yesterdayInfo:function(){
        var $yestdayList = $(".info-list");
        var $yestdayListBox = $('.info-list-box');
        //{name: "郑州市-绿地之窗", total_money: "63360.00", total_flow: 21264}
        setInterval(getData,10000)
        getData();
        function getData(){
            $.ajax({
                url:config['zuori_yunying'],
                success:function(data){
                    if(data.code==1){
                        render(data.data);
                    }else{
                        render([]);
                    }
                },
                error:function(){
                    render([]);
                }
            })
        }
        function render(data){
            var str ='';
            for(var i=0;i<data.length;i++){
                str += `<li>
                    <h3>${data[i].name}</h3>
                    <div>
                        <span class="left">进出车辆 <i>${data[i].total_flow}</i></span>
                        <span class="right">总收入 <i>￥${data[i].total_money}</i></span>
                    </div>
                </li>`
            }
            $yestdayListBox.html(str);
        }
        $(window).load(function(){
            
            var yestdayListHeight = $yestdayList.height();
            var yestdayListBoxHeight = $yestdayListBox.height();
            // console.log(yestdayListBoxHeight)
            var top = 0;
            var yestdayT = setInterval(slideMove,100)
            function slideMove(){
                top--;
                if(Math.abs(top)>(yestdayListBoxHeight-yestdayListHeight)){
                    top = 0;
                }
                $yestdayListBox.css({
                    top:top+'px'
                })
            }
            $yestdayList.hover(function(){
                clearInterval(yestdayT);
            },function(){
                yestdayT = setInterval(slideMove,100)
            })
       }) 
       return this;
    },
    //停车照片
    stopPhoto:function(){
        /*
        in_out_time:"2018-05-09 13:33:43"
        name:"上海市-公元1860商务广场"
        park_id:12835
        photoFilepathIn:"http://117.143.216.42:18080/KT_ServerSoft/CarPlateRecognise//20180509/172.19.2.38/13/20180509133343680_172.19.2.38_000202.jpg"
        plate_num:"沪C1SR36"
        */
        var $stopPhoto = $(".stop-photo");
        var $stopBox = $('.stop-box');
        
        function getData(){
            $.ajax({
                url:config['china_new_plot'],
                success:function(data){
                    if(data.code==1){
                        render(data.data)
                    }else{
                        render([])
                    }
                },
                error:function(){
                    render([])
                }
            })
        }
        setInterval(getData,10000)
        function render(data){
            var str = "";
            for(var i=0;i<data.length;i++){
                str+=`<li>
                    <div class="in-outtime">${data[i].in_out_time}</div>
                    <div class="img" style="background-image: url(${data[i].photoFilepathIn})"></div>
                    <div class="stop-name">${data[i].name}</div>
                    <div class="stop-number">车牌 ${data[i].plate_num}</div>
                </li>`
            }
            $stopBox.html(str);
        }
        $(window).load(function(){
            
            getData();
            var left = 0;
            
            var stopT = setInterval(slideMove,100);

            function slideMove(){
                var $lis = $stopBox.find('li'); 
                var stopPhotoWidth = $stopPhoto.width();
                var stopBoxWidth = ($lis.length)*($lis[0].offsetWidth+8)+5;
                $stopBox.css({width:stopBoxWidth+'px'});

                left--;
                if(Math.abs(left)>(stopBoxWidth-stopPhotoWidth)){
                    left = 0;
                }
                $stopBox.css({
                    left:left+'px'
                })
            }
            $stopPhoto.hover(function(){
                clearInterval(stopT);
            },function(){
                stopT = setInterval(slideMove,100)
            })
       }) 
       return this;
    },
    //停车收费排行
    stopTop:function(){
        var $stopPayType= $(".stop-top .stop-pay-type");
        var $stopPayTime = $(".stop-top .stop-pay-time");
        var stopPayTimeOption = {
            color:['#b8e3ff','#009cff'],
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'horizontal',
                bottom: 15,
                itemWidth:5,
                data:['提前缴费','出口缴费'],
                textStyle:{
                    color:'#839bb0'
                }
            },
            series: [
                {
                    name:'缴费情况',
                    type:'pie',
                    center:['50%','40%'],
                    radius: ['45%', '65%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '14',
                                // fontWeight: 'bold'
                            }
                        }
                    },
                    data:[
                        {value:120, name:'提前缴费',selected:true},
                        {value:310, name:'出口缴费'}
                    ]
                }
            ]
        };
        var stopPayTypeOption = {
            color:['#fffbbe','#ffbd3d'],
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'horizontal',
                bottom: 15,
                itemWidth:5,
                data:['现金缴费','电子缴费'],
                textStyle:{
                    color:'#839bb0'
                }
            },
            series: [
                {
                    name:'缴费类型',
                    type:'pie',
                    radius: ['45%', '65%'],
                    center:['50%','40%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '14'
                            }
                        }
                    },
                    data:[
                        {value:35, name:'现金缴费',selected:true},
                        {value:310, name:'电子缴费'}
                    ]
                }
            ]
        };
        $(window).load(function(){
            var stopPayTypeChart = echarts.init($stopPayType[0]);
            var stopPayTimeChart = echarts.init($stopPayTime[0]);
            if(stopPayTypeOption){
                stopPayTypeChart.setOption(stopPayTypeOption, true);
            }
            if(stopPayTimeOption){
                stopPayTimeChart.setOption(stopPayTimeOption,true)
            }
        })
        return this;
    },
    //中间地图
    showMap:function(){

       function convertGeoCoord(data){
            var d = [];
            //{"code":1,"data":[{"park_id":11442,"name":"1号停车场-A","baidumap_longitude":"108.909992538480","baidumap_latitude":"34.247720227097","province_code":"61","value":11442}
            //[{"name":"1号停车场-A",value:[108.909992538480,34.247720227097,1123]}]
            for(var i=0;i<data.length;i++){
                var o = {};
                o['name'] = data[i].name;
                o['park_id'] = data[i]['park_id'];
                o['value'] = [data[i].baidumap_longitude,data[i].baidumap_latitude,data[i].value]
                d.push(o)
            }
            return d;
       }
        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var geoCoord = geoCoordMap[data[i].name];
                if (geoCoord) {
                    res.push({
                        name: data[i].name,
                        value: geoCoord.concat(data[i].value)
                    });
                }
            }
            return res;
        };
        
        var mapOption = {
            tooltip: {
                trigger: 'item',
                borderColor:"rgb(74, 223, 255)",
                // alwaysShowContent:true,
                borderWidth:1,
                padding:20,
                position:'left',
                triggerOn:'none',
                formatter: function (params) {
                    // console.log(params)
                    console.log(params.name)
                    // return params.name + ' : ' + params.value[2];
                    return `<div class="modal">
                        <h2>${params.name}</h2>
                        <div class="text">今日收入</div>
                        <div class="money">${params.data.data.total_money}</div>
                        <div class="car">
                            <div class="left">
                                <span>总车位</span>
                                <span>${params.data.data.total_seat}</span>
                            </div>
                            <div class="right">
                                <span>空余</span>
                                <span>${params.data.data.surplus_seat}</span>
                            </div>
                        </div>
                        <div class="bottom">
                            <div>本日进场 ${params.data.data.in_number}</div>
                            <div>本日出场 ${params.data.data.out_number}</div>
                        </div>
                    </div>`;
                }
            },
            legend: {
                orient: 'vertical',
                y: 'bottom',
                x:'right',
                data:['pm2.5'],
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                type:'scatter',
                map: 'china',
                zoom:5.5,
                layoutCenter: ['50%', '50%'],
                layoutSize:100,
                roam:false,
                label: {
                    emphasis: {
                      //    是否显示鼠标移入省份的时候显示出省份名称
                        show: true
                    }
                 },
                itemStyle: {
                    normal: {                   
                        areaColor: '#194e7c',
                        borderColor: '#111'
                    },
                    emphasis: {                 
                        areaColor: '#52a8eb'
                    }
                }
            },
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: [],
                    symbolSize: function (val) {
                        return val[2]/1100;
                    },
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#ed3e3e',
                            shadowBlur: 10,
                            shadowColor: '#873b4b'
                        }
                    }
                },
                {
                    name: 'Top5',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: [] ,
                    symbolSize: function (val) {
                        return val[2]/ 500;
                    },
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    hoverAnimation: true,
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#4affd2',
                            shadowBlur: 10,
                            shadowColor: '#873b4b'
                        }
                    },
                    zlevel: 1
                }
            ]
        }
        
        window.onload = function(){
            var allData = [];
            var mapChart = echarts.init($('.map')[0]);
            
            if(mapOption){
                mapChart.setOption(mapOption);
                window.onresize = mapChart.onresize;  
            }
            $.ajax({
                url:config['all_city_stop'],
                success:function(data){
                     if(data.code==1){
                         allData = convertGeoCoord(data.data);
                         mapOption.series[0].data = allData;
                         mapOption.series[1].data = [allData[0]];
                         mapChart.setOption(mapOption);
                         var index = 0 ;
                         for(let i=0;i<allData.length;i++){
                            $.ajax({
                                url:config['one_stop_info']+'?park_id='+allData[i].park_id,
                                success:function(data){
                                    allData[i].data = data.data;
                                    index++;
                                }
                            })
                         }
                         
                     }
                }
            })
            var index=0;
            setInterval(function(){
                var i = index%allData.length;
                mapOption.series[1].data = [allData[i]];
                mapChart.setOption(mapOption); 
                console.log(allData[i])
                mapChart.dispatchAction({type: 'showTip',seriesIndex: '1', name:allData[i].name});
                index++;
            },3000)
        }
        
        return this;
    },
    //全国所有停车场停车信息
    getAllInfo:function(){
        var $stopCol = $(".stop-col-inner");
        var $total = $stopCol.eq(0).find("div:first");
        var $occupy = $stopCol.eq(1).find("div:first");
        var $ratio = $stopCol.eq(2).find("div:first");
        //{"code":1,"data":{"total_seat":"37548","occupy_seat":35759,"ratio":95.24}}
        setInterval(getData,2000);
        function getData(){
            $.ajax({
                url:config['stop_info'],
                success:function(data){
                    if(data.code==1){
                        render(data.data);
                    }
                }
            })
        }
        function render(data){
            $total.html(data.total_seat);
            $occupy.html(data.occupy_seat);
            $ratio.html(data.ratio+'%');
        }
    }
}
stopCar.updateTime().stopLength().deviceWarning().yesterdayInfo().stopPhoto().showMap();


stopCar.todayIncome()
stopCar.getAllInfo();
stopCar.stopTop();
