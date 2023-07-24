//전역변수
let map;

$(function() {
    let userAgent = navigator.userAgent.toLowerCase();
    
    //ios(아이폰, 아이패드, 아이팟) 전용 css 적용
    if (userAgent.indexOf("iphone") > -1 || userAgent.indexOf("ipad") > -1 || userAgent.indexOf("ipod") > -1) {
        let cssIosLink = document.createElement("link");

        cssIosLink.href = "css/member-ios.css";
        cssIosLink.async = false;
        cssIosLink.rel = "stylesheet";
        cssIosLink.type = "text/css";

        document.head.appendChild(cssIosLink);
    }
    
    //리사이즈
    $(window).resize(function() {
        let winWidth = window.innerWidth;
        
        //모바일에서 100vh 오류 해결방법
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        //모바일일 경우 통합검색&즐겨찾기 하위 탭 설정
        if (winWidth < 768 && $(".map-list-area").hasClass("on")) {
            //통합검색 하위 탭이 전체가 아닐 경우 전체 탭으로 설정
            if ($(".map-list-search").hasClass("on") && $(".map-search-tab").find(".c-tab").children("li.on").attr("data-tab-name") != "all") {
                setMapListTab($(".map-list-search").find(".map-search-tab").find(".c-tab").children("li").eq(0));
            }
            
            //즐겨찾기 하위 탭이 전체일 경우 버스 탭으로 설정
            if ($(".map-list-bookmark").hasClass("on") && $(".map-bookmark-tab").find(".c-tab").children("li.on").attr("data-tab-name") == "all") {
                setMapListTab($(".map-list-bookmark").find(".map-bookmark-tab").find(".c-tab").children("li").eq(1));
            }
        }
    });
    
    //모바일에서 100vh 오류 해결방법
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    //레이어창(전체창)에서 뒤로가기시 창닫기
    $(document).on("click", ".l-open-btn", function() {
        window.history.pushState({}, "", window.location.href);
    }).on("click", ".l-full-area .l-box .l-tit-area .l-tit-btn", function() {
        window.history.back();
    });
    
    window.onpopstate = history.onpushstate = function(e) {
        if (window.location.href.split('/').pop().indexOf("modal") === -1) {
            //뒤로가기
            $(".l-full-area .l-box .l-tit-area .l-hidden-btn").trigger("click");
        }
    }
    
    //맵 로딩시 탭 설정
    $(".c-tab-area .c-tab").each(function() {
        setMapListTab($(this).children("li").eq(0));
    });
    
    //20230724 수정부분 start
    //맵 탭 클릭시 탭 설정
    $(".c-tab-area .c-tab>li").on("click", function() {
        setMapListTab($(this));
    });
    //20230724 수정부분 end
    
    //맵 로딩시 버스위치 버튼 노출안함
    $(".map-menu-list>li[data-menu-type='position']").css("display", "none");
    
    //지도 설정
    setMapInit();
});

//맵 최근검색 목록 전체삭제
function delSearchAll() {
    $(".map-list-search").find(".map-list-main").find(".mlm-list-area").find(".mlm-list").children("li").each(function() {
        $(this).remove();
    });
}

//맵 최근검색 항목 삭제
function delSearchItem(obj) {
    $(obj).closest("li").remove();
}

//맵 즐겨찾기 목록 전체삭제
function delBookmarkAll() {
    $(".map-list-bookmark").find(".map-list-main").find(".mlm-list-area").find(".mlm-list").children("li").each(function() {
        $(this).remove();
    });
}

//맵 기록삭제
function delHistoryAll() {
    //맵 최근검색 목록 전체삭제
    delSearchAll();
    
    //맵 즐겨찾기 목록 전체삭제
    delBookmarkAll();
    
    //맵 상세에서 즐겨찾기 전체해제
    $(".map-info-area").find(".bookmark-btn").removeClass("on");
}

//맵 탭 설정
function setMapListTab(obj) {
    if (obj.length > 0) {
        let dataTabType = obj.attr("data-tab-type");
        let dataTabName = obj.attr("data-tab-name");
        
        obj.parent(".c-tab").children("li").removeClass("on");
        obj.addClass("on");
        
        $(".c-tab-item[data-tab-type='" + dataTabType + "']").removeClass("on");
        
        if (dataTabName == "all") {
            $(".c-tab-item[data-tab-type='" + dataTabType + "']").addClass("on");
        } else {
            $(".c-tab-item[data-tab-type='" + dataTabType + "'][data-tab-name='" + dataTabName + "']").addClass("on");
        }
        
        if (dataTabType == "list") {
            if (dataTabName == "search") {
                //통합검색 탭
                setSearchList();
            } else if (dataTabName == "bookmark") {
                //즐겨찾기 탭
                setBookmarkList();
            }
        } else if (dataTabType == "search") {
            if (dataTabName == "all") {
                //전체 탭
                $(".map-list-search").find(".map-list-main").find(".mlm-top-area").find(".delete-btn").addClass("on");
            } else {
                //버스&정류장 탭
                $(".map-list-search").find(".map-list-main").find(".mlm-top-area").find(".delete-btn").removeClass("on");
            }
        } else if (dataTabType == "bookmark") {
            if (dataTabName == "all") {
                //전체 탭
                $(".map-list-bookmark").find(".map-list-main").find(".mlm-top-area").find(".delete-btn").addClass("on");
            } else {
                //버스&정류장 탭
                $(".map-list-bookmark").find(".map-list-main").find(".mlm-top-area").find(".delete-btn").removeClass("on");
            }
        }
    }
}

//맵 목록 보이기&숨기기
function setMapListView(obj) {
    if ($(obj).closest(".c-tab-item").hasClass("show")) {
        $(obj).closest(".c-tab-item").removeClass("show");
    } else {
        $(obj).closest(".c-tab-item").addClass("show");
    }
}

//맵 버스&정류장 정보 보이기&숨기기
function setMapInfoView(obj) {
    if ($(obj).closest(".map-info-area").hasClass("show")) {
        $(obj).closest(".map-info-area").removeClass("show");
    } else {
        $(obj).closest(".map-info-area").addClass("show");
    }
}

//맵 노선 보이기&숨기기
function setMapRouteView(obj) {
    let liIdx = $(obj).closest("li").index();
    
    if (!$(obj).closest("li").hasClass("show")) {
        $(obj).closest(".map-info-list").children("li").not("li:eq(" + liIdx + ")").children(".map-info-line").stop(true,true).slideUp(200, function() {
            $(this).html("");
            $(this).closest("li").removeClass("show");
        });
        
        setRouteLine($(obj).closest("li").children(".map-info-line"));
        
        $(obj).closest("li").children(".map-info-line").stop(true,true).slideDown(200, function() {
            $(this).closest("li").addClass("show");
            
            let ulTop = $(this).closest(".map-info-list").scrollTop();
            let liTop = $(this).closest("li").position().top;
            
            $(this).closest(".map-info-list").animate({scrollTop: ulTop + liTop}, 200);
        });
    } else {
        $(obj).closest("li").children(".map-info-line").stop(true,true).slideUp(200, function() {
            $(this).html("");
            $(this).closest("li").removeClass("show");
        });
    }
}

//맵 즐겨찾기 설정
function setBookmarkItem(type, obj) {
    if (type == "bookmark") {
        //즐겨찾기 탭일 경우
        $(obj).closest("li").remove();
    } else {
        //통합검색 탭일 경우
        if ($(obj).hasClass("on")) {
            $(obj).removeClass("on");
        } else {
            $(obj).addClass("on");
        }
    }
}

//맵 버스위치 설정
function setBusPosition(obj) {
    if ($(obj).hasClass("on")) {
        $(obj).removeClass("on");
    } else {
        $(obj).addClass("on");
    }
}

//맵 내위치 설정
function setGpsPosition(obj) {
    if ($(obj).hasClass("on")) {
        $(obj).removeClass("on");
    } else {
        $(obj).addClass("on");
    }
}

//맵 통합검색 목록 설정
function setSearchList() {
    let listHtml = `
        <div class="map-list-top">
            <button type="button" class="back-btn only-mobile" onclick="closeSearchLayer(this);">
                <span>통합검색닫기</span>
            </button>
            <form id="" name="" method="" action="">
                <div class="c-search-box">
                    <input type="text" id="" name="" class="c-search-input" placeholder="노선번호, 정류장번호를 입력하세요">
                    <input type="button" value="검색" class="c-search-btn">
                </div>
            </form>
        </div>
    `;

     //map-search-tab : 통합검색의 전체&버스&정류장 탭
     listHtml += `
        <div class="c-tab-area map-search-tab only-pc">
            <ul class="c-tab">
                <li data-tab-type="search" data-tab-name="all">전체</li>
                <li data-tab-type="search" data-tab-name="bus">버스</li>
                <li data-tab-type="search" data-tab-name="station">정류장</li>
            </ul>
        </div>
    `;

    listHtml += `
        <div class="map-list-main">
            <div class="mlm-top-area">
                <div class="mlm-top-txt">최근검색 목록</div>
                <button type="button" class="delete-btn only-pc" onclick="openLayer('confirm','최근검색 목록을<br>모두 삭제하시겠습니까?','delSearchAll();');">
                    <span>전체삭제</span>
                </button>
            </div>
            <div class="mlm-list-area">
    `;

    //통합검색의 버스 영역 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
    listHtml += `
                <div class="c-tab-item map-search-bus" data-tab-type="search" data-tab-name="bus">
                    <ul class="mlm-list">
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                <div class="type skyblue-item">1</div>
                                <div class="stop">진웅종점 <span class="direct"></span> 인천성모병원종점지주차장</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('search',this);">
                                    <span>즐겨찾기</span>
                                </button>
                                <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                    <span>항목삭제</span>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                <div class="type green-item">10<span>(강화)</span></div>
                                <div class="stop">강화터미널 <span class="direct"></span> 돌머리 (대산종점)</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                    <span>즐겨찾기</span>
                                </button>
                                <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                    <span>항목삭제</span>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                <div class="type red-item">1000</div>
                                <div class="stop">경남아너스빌 <span class="direct"></span> 서울역</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                    <span>즐겨찾기</span>
                                </button>
                                <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                    <span>항목삭제</span>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
    `;

    //통합검색의 정류장 영역
    listHtml += `
                <div class="c-tab-item map-search-station" data-tab-type="search" data-tab-name="station">
                    <ul class="mlm-list">
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                <div class="type station-item">e편한세상계양</div>
                                <div class="num">[41038]</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('search',this);">
                                    <span>즐겨찾기</span>
                                </button>
                                <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                    <span>항목삭제</span>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                <div class="type station-item">갈현경로당</div>
                                <div class="num">[41491]</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                    <span>즐겨찾기</span>
                                </button>
                                <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                    <span>항목삭제</span>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
    `;

    listHtml += `
            </div>
            <button type="button" class="delete-btn3 only-mobile" onclick="openLayer('confirm','최근검색 목록을<br>모두 삭제하시겠습니까?','delSearchAll();');">
                <span>전체삭제</span>
            </button>
        </div>
    `;

    $(".map-list-search").html(listHtml);

    setMapListTab($(".map-list-search").find(".map-search-tab").find(".c-tab").children("li").eq(0));
    
    //20230724 수정부분 start
    //맵 탭 클릭시 탭 설정
    $(".map-search-tab .c-tab>li").on("click", function() {
        setMapListTab($(this));
    });
    //20230724 수정부분 end
    
    //맵 통합검색 검색창 입력시 목록 설정
    let inputTimer;
    
    $(".map-list-search").find(".map-list-top").find(".c-search-box").find(".c-search-input").on("propertychange keyup paste input", function() {
        clearTimeout(inputTimer);
        
        let inputVal = $(this).val();
        
        inputTimer = setTimeout(function() {
            setSearchInputList(inputVal);
        }, 500);
    });
}

//맵 검색창 목록 설정
function setSearchInputList(keyword) {
    let listHtml = "";
    
    if (keyword != "" && keyword != null && keyword != undefined) {
        //검색창에 검색어가 있을 경우
        //통합검색의 버스 영역 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
        listHtml += `
                <div class="c-tab-item map-search-bus show" data-tab-type="search" data-tab-name="bus">
                    <div class="mlm-top-area">
                        <div class="mlm-top-txt">버스(3)</div>
                        <button type="button" class="view-btn" onclick="setMapListView(this);">
                            <span>목록 보이기/숨기기</span>
                        </button>
                    </div>
                    <div class="mlm-list-area">
                        <ul class="mlm-list">
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                    <div class="type skyblue-item">1</div>
                                    <div class="stop">진웅종점 <span class="direct"></span> 인천성모병원종점지주차장</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                </div>
                            </li>
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                    <div class="type green-item">10<span>(강화)</span></div>
                                    <div class="stop">강화터미널 <span class="direct"></span> 돌머리 (대산종점)</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                </div>
                            </li>
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                    <div class="type red-item">1000</div>
                                    <div class="stop">경남아너스빌 <span class="direct"></span> 서울역</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
        `;

        //통합검색의 정류장 영역
        listHtml += `
                <div class="c-tab-item map-search-station show" data-tab-type="search" data-tab-name="station">
                    <div class="mlm-top-area">
                        <div class="mlm-top-txt">정류장(2)</div>
                        <button type="button" class="view-btn" onclick="setMapListView(this);">
                            <span>목록 보이기/숨기기</span>
                        </button>
                    </div>
                    <div class="mlm-list-area">
                        <ul class="mlm-list">
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                    <div class="type station-item">e편한세상계양</div>
                                    <div class="num">[41038]</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                </div>
                            </li>
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                    <div class="type station-item">갈현경로당</div>
                                    <div class="num">[41491]</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
        `;
    } else {
        //검색창에 검색어가 없을 경우
        listHtml += `
                <div class="mlm-top-area">
                    <div class="mlm-top-txt">최근검색 목록</div>
                    <button type="button" class="delete-btn only-pc" onclick="openLayer('confirm','최근검색 목록을<br>모두 삭제하시겠습니까?','delSearchAll();');">
                        <span>전체삭제</span>
                    </button>
                </div>
                <div class="mlm-list-area">
        `;

        //통합검색의 버스 영역 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
        listHtml += `
                    <div class="c-tab-item map-search-bus" data-tab-type="search" data-tab-name="bus">
                        <ul class="mlm-list">
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                    <div class="type skyblue-item">1</div>
                                    <div class="stop">진웅종점 <span class="direct"></span> 인천성모병원종점지주차장</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                    <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                        <span>항목삭제</span>
                                    </button>
                                </div>
                            </li>
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                    <div class="type green-item">10<span>(강화)</span></div>
                                    <div class="stop">강화터미널 <span class="direct"></span> 돌머리 (대산종점)</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                    <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                        <span>항목삭제</span>
                                    </button>
                                </div>
                            </li>
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                    <div class="type red-item">1000</div>
                                    <div class="stop">경남아너스빌 <span class="direct"></span> 서울역</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                    <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                        <span>항목삭제</span>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
        `;

        //통합검색의 정류장 영역
        listHtml += `
                    <div class="c-tab-item map-search-station" data-tab-type="search" data-tab-name="station">
                        <ul class="mlm-list">
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                    <div class="type station-item">e편한세상계양</div>
                                    <div class="num">[41038]</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                    <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                        <span>항목삭제</span>
                                    </button>
                                </div>
                            </li>
                            <li>
                                <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                    <div class="type station-item">갈현경로당</div>
                                    <div class="num">[41491]</div>
                                </div>
                                <div class="mlm-list-btn">
                                    <button type="button" class="bookmark-btn" onclick="setBookmarkItem('search',this);">
                                        <span>즐겨찾기</span>
                                    </button>
                                    <button type="button" class="delete-btn2" onclick="delSearchItem(this);">
                                        <span>항목삭제</span>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
        `;

        listHtml += `
                </div>
                <button type="button" class="delete-btn3 only-mobile" onclick="openLayer('confirm','최근검색 목록을<br>모두 삭제하시겠습니까?','delSearchAll();');">
                    <span>전체삭제</span>
                </button>
        `;
    }

    $(".map-list-search").find(".map-list-main").html(listHtml);

    setMapListTab($(".map-list-search").find(".map-search-tab").find(".c-tab").children("li.on"));
}

//맵 즐겨찾기 목록 설정
function setBookmarkList() {
    let winWidth = window.innerWidth;
    
    let listHtml = `
        <div class="map-list-top only-mobile">
            <button type="button" class="back-btn" onclick="closeBookmarkLayer(this);">
                <span>즐겨찾기닫기</span>
            </button>
            <div class="map-list-tit">즐겨찾기</div>
        </div>
    `;
    
    //map-bookmark-tab : 즐겨찾기의 전체&버스&정류장 탭
    listHtml += `
        <div class="c-tab-area map-bookmark-tab">
            <ul class="c-tab">
                <li class="only-pc" data-tab-type="bookmark" data-tab-name="all">전체</li>
                <li data-tab-type="bookmark" data-tab-name="bus">버스</li>
                <li data-tab-type="bookmark" data-tab-name="station">정류장</li>
            </ul>
        </div>
    `;

    listHtml += `
        <div class="map-list-main">
            <div class="mlm-top-area">
                <div class="mlm-top-txt">즐겨찾기 목록</div>
                <button type="button" class="delete-btn only-pc" onclick="openLayer('confirm','즐겨찾기 목록을<br>모두 삭제하시겠습니까?','delBookmarkAll();');">
                    <span>전체삭제</span>
                </button>
            </div>
            <div class="mlm-list-area">
    `;
    
    //즐겨찾기의 버스 영역 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
    listHtml += `
                <div class="c-tab-item map-bookmark-bus" data-tab-type="bookmark" data-tab-name="bus">
                    <ul class="mlm-list">
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                <div class="type skyblue-item">1</div>
                                <div class="stop">진웅종점 <span class="direct"></span> 인천성모병원종점지주차장</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('bookmark',this);">
                                    <span>즐겨찾기</span>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                <div class="type green-item">10<span>(강화)</span></div>
                                <div class="stop">강화터미널 <span class="direct"></span> 돌머리 (대산종점)</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('bookmark',this);">
                                    <span>즐겨찾기</span>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('route',this);">
                                <div class="type red-item">1000</div>
                                <div class="stop">경남아너스빌 <span class="direct"></span> 서울역</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('bookmark',this);">
                                    <span>즐겨찾기</span>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
    `;

    //즐겨찾기의 정류장 영역
    listHtml += `
                <div class="c-tab-item map-bookmark-station" data-tab-type="bookmark" data-tab-name="station">
                    <ul class="mlm-list">
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                <div class="type station-item">e편한세상계양</div>
                                <div class="num">[41038]</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('bookmark',this);">
                                    <span>즐겨찾기</span>
                                </button>
                            </div>
                        </li>
                        <li>
                            <div class="mlm-list-txt" onclick="openMapInfoLayer('station',this);">
                                <div class="type station-item">갈현경로당</div>
                                <div class="num">[41491]</div>
                            </div>
                            <div class="mlm-list-btn">
                                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('bookmark',this);">
                                    <span>즐겨찾기</span>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
    `;
    
    listHtml += `
            </div>
            <button type="button" class="delete-btn3 only-mobile" onclick="openLayer('confirm','즐겨찾기 목록을<br>모두 삭제하시겠습니까?','delBookmarkAll();');">
                <span>전체삭제</span>
            </button>
        </div>
    `;
    
    $(".map-list-bookmark").html(listHtml);
    
    if (winWidth < 768) {
        setMapListTab($(".map-list-bookmark").find(".map-bookmark-tab").find(".c-tab").children("li").eq(1));
    } else {
        setMapListTab($(".map-list-bookmark").find(".map-bookmark-tab").find(".c-tab").children("li").eq(0));
    }
    
    //20230724 수정부분 start
    //맵 탭 클릭시 탭 설정
    $(".map-bookmark-tab .c-tab>li").on("click", function() {
        setMapListTab($(this));
    });
    //20230724 수정부분 end
}

//맵 노선 정보 설정
function setRouteInfo(obj) {
    //skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스
    let infoHtml = `
        <div class="map-info-top">
            <div class="mii-txt">
                <div class="type skyblue-item">1</div>
                <div class="num"><span id="">15</span>대 운행중 | 정류장 <span id="">000</span>개소</div>
            </div>
            <div class="mii-inline-btn">
                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('bus',this);">
                    <span>즐겨찾기</span>
                </button>
                <button type="button" class="close-btn2" onclick="closeMapInfoLayer(this);">
                    <span>창닫기</span>
                </button>
            </div>
        </div>
        <div class="map-info-detail">
            <div class="mii-info-item">
                <div class="mii-info-con">진웅종점 <span class="direct"></span> 인천성모병원종점지주차장</div>
            </div>
            <div class="mii-info-item">
                <div class="mii-info-tit">운행시간</div>
                <div class="mii-info-con">
                    <div class="con-item">
                        <div class="tit firststop">기점</div>
                        <div class="con">평일 05:00~22:40 / 주말 05:00~22:40</div>
                    </div>
                    <div class="con-item">
                        <div class="tit laststop">종점</div>
                        <div class="con">평일 05:00~23:20 / 주말 05:00~23:20</div>
                    </div>
                </div>
            </div>
            <div class="mii-info-item">
                <div class="mii-info-tit">배차간격</div>
                <div class="mii-info-con">평일 14~19분 / 주말 22~28분</div>
            </div>
        </div>
        <div class="map-info-line"></div>
    `;
    
    $(".map-info-item").html(infoHtml);
    
    setRouteLine($(".map-info-item .map-info-line"));
}

//맵 버스 정보 설정
function setBusInfo(obj) {
    //skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스
    let infoHtml = `
        <div class="map-info-top">
            <div class="mii-txt">
                <div class="type skyblue-item">1</div>
                <div class="num"><span id="">0000</span> | <span id="">00</span>km</div>
            </div>
            <div class="mii-inline-btn">
                <button type="button" class="share-btn" onclick="">
                    <span>공유하기</span>
                </button>
                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('bus',this);">
                    <span>즐겨찾기</span>
                </button>
                <button type="button" class="close-btn2" onclick="closeMapInfoLayer(this);">
                    <span>창닫기</span>
                </button>
            </div>
        </div>
        <div class="map-info-detail">
            <div class="mii-info-item">
                <div class="mii-info-con">진웅종점 <span class="direct"></span> 인천성모병원종점지주차장</div>
            </div>
            <div class="mii-info-item">
                <div class="mii-info-tit">운행시간</div>
                <div class="mii-info-con">
                    <div class="con-item">
                        <div class="tit firststop">기점</div>
                        <div class="con">평일 05:00~22:40 / 주말 05:00~22:40</div>
                    </div>
                    <div class="con-item">
                        <div class="tit laststop">종점</div>
                        <div class="con">평일 05:00~23:20 / 주말 05:00~23:20</div>
                    </div>
                </div>
            </div>
            <div class="mii-info-item">
                <div class="mii-info-tit">배차간격</div>
                <div class="mii-info-con">평일 14~19분 / 주말 22~28분</div>
            </div>
        </div>
        <div class="map-info-line"></div>
    `;
    
    $(".map-info-item").html(infoHtml);
    
    setRouteLine($(".map-info-item .map-info-line"));
}

//맵 정류장 정보 설정
function setStationInfo(obj) {
    let infoHtml = `
        <div class="map-info-top">
            <div class="mii-txt">
                <div class="type station-item">e편한세상계양</div>
                <div class="num">[41038]</div>
            </div>
            <div class="mii-inline-btn">
                <button type="button" class="bookmark-btn on" onclick="setBookmarkItem('station',this);">
                    <span>즐겨찾기</span>
                </button>
                <button type="button" class="close-btn2" onclick="closeMapInfoLayer(this);">
                    <span>창닫기</span>
                </button>
            </div>
        </div>
        <ul class="map-info-list">
    `;
    
    //skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스
    infoHtml += `
            <li>
                <div class="map-info-tit">
                    <div class="mii-txt" onclick="openMapInfoLayer('bus',this);">
                        <div class="type skyblue-item">14</div>
                        <div class="stop">항동7가버스차고지 방면</div>
                    </div>
                    <div class="mii-variable">
                        <div class="minute">2분 전</div>
                        <div class="position">(1정류장 전)</div>
                    </div>
                    <div class="mii-btn">
                        <button type="button" class="bookmark-btn" onclick="setBookmarkItem('bus',this);">
                            <span>즐겨찾기</span>
                        </button>
                        <button type="button" class="view-btn" onclick="setMapRouteView(this);">
                            <span>노선 보이기/숨기기</span>
                        </button>
                    </div>
                </div>
                <div class="map-info-line"></div>
            </li>
            <li>
                <div class="map-info-tit">
                    <div class="mii-txt" onclick="openMapInfoLayer('bus',this);">
                        <div class="type green-item">14</div>
                        <div class="stop">항동7가버스차고지 방면</div>
                    </div>
                    <div class="mii-variable">
                        <div class="minute">3분 전</div>
                        <div class="position">(2정류장 전)</div>
                    </div>
                    <div class="mii-btn">
                        <button type="button" class="bookmark-btn" onclick="setBookmarkItem('bus',this);">
                            <span>즐겨찾기</span>
                        </button>
                        <button type="button" class="view-btn" onclick="setMapRouteView(this);">
                            <span>노선 보이기/숨기기</span>
                        </button>
                    </div>
                </div>
                <div class="map-info-line"></div>
            </li>
            <li>
                <div class="map-info-tit">
                    <div class="mii-txt" onclick="openMapInfoLayer('route',this);">
                        <div class="type red-item">14</div>
                        <div class="stop">항동7가버스차고지 방면</div>
                    </div>
                    <div class="mii-variable">
                        <div class="minute">도착정보없음</div>
                    </div>
                    <div class="mii-btn">
                        <button type="button" class="bookmark-btn" onclick="setBookmarkItem('bus',this);">
                            <span>즐겨찾기</span>
                        </button>
                        <button type="button" class="view-btn" onclick="setMapRouteView(this);">
                            <span>노선 보이기/숨기기</span>
                        </button>
                    </div>
                </div>
                <div class="map-info-line"></div>
            </li>
    `;
    
    infoHtml += `
        </ul>
    `;
    
    $(".map-info-item").html(infoHtml);
}

//맵 노선도 설정
function setRouteLine(obj) {
    let lineHtml = `
            <ul class="mii-line-list">
    `;
    
    //upstop : 기점 > 종점 방향의 정류장, downstop : 종점 > 기점 방향의 정류장, firststop : 기점 정류장, laststop : 종점 정류장
    //skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스, move : 이동중인 버스
    lineHtml += `
                <li class="upstop firststop" data-station-order="1">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">진웅종점</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="2">
                    <div class="img">
                        <div class="direction-img"></div>
                        <div class="bus-img skyblue-item move" onclick="openMapInfoLayer('bus',this);">
                            <div class="bus-num">0000</div>
                        </div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">한일금속</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="3">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">검단지식산업센타</div>
                        <div class="minute">곧 도착</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="4">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">JST기술연구소</div>
                        <div class="minute">2분 전</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="5">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">삼영테크</div>
                        <div class="minute">3분 전</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="6">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">금란마트</div>
                        <div class="minute">5분 전</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="7">
                    <div class="img">
                        <div class="direction-img"></div>
                        <div class="bus-img green-item" onclick="openMapInfoLayer('bus',this);">
                            <div class="bus-num">1111</div>
                        </div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">검단오류역</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="8">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">오류동역입구</div>
                        <div class="minute">2분 전</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="9">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">검단오류역우방아이유쉘</div>
                        <div class="minute">3분 전</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="10">
                    <div class="img">
                        <div class="direction-img"></div>
                        <div class="bus-img red-item move" onclick="openMapInfoLayer('bus',this);">
                            <div class="bus-num">2222 <span>저상</span></div>
                        </div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">단봉초등학교</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="11">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">길훈아파트</div>
                        <div class="minute">곧 도착</div>
                    </div>
                </li>
                <li class="upstop" data-station-order="12">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">동성아파트</div>
                        <div class="minute">2분 후</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="13">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">성민병원</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="14">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">석남역(5번출구)</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="15">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">동아아파트후문</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="16">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">부원여중.동아아파트</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="17">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">부원중학교</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="18">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">부평역(대한극장)</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="19">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">부평역</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="20">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">굴다리오거리</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="21">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">동수치안센터v</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="22">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">인천예림학교(인천성모병원)</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop" data-station-order="23">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">부평역화성파크드림아파트</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
                <li class="downstop laststop" data-station-order="24">
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                    <div class="txt" onclick="openMapInfoLayer('station',this);">
                        <div class="station-name">인천성모병원종점지주차장</div>
                        <div class="minute">도착정보없음</div>
                    </div>
                </li>
    `;
    
    lineHtml += `
            </ul>
    `;
    
    $(obj).html(lineHtml);
}

//레이어창 열기
function openLayer(type, msg, fun) {
    $("#" + type + "-layer .l-box .l-con-area .l-con").html(msg);
    
    $("#" + type + "-layer .l-box .l-btn-area .confirm-btn").removeAttr("onclick");
    $("#" + type + "-layer .l-box .l-btn-area .confirm-btn").attr("onclick","closeLayer(this);" + fun);
    
    $("#" + type + "-layer").addClass("on");
    
    let scrollTop = parseInt($(document).scrollTop());

    $("body").css("top", -scrollTop + "px");

    $("body").addClass("scroll-disable").on('scroll touchmove', function(event) {
        event.preventDefault();
    });
}

//공지사항 목록창 열기
function openNoticeListLayer(obj) {
    if ($("#notice-layer").find(".l-notice-list").html() == "") {
        //타이틀 + 검색창
        let noticeListHtml = `
            <div class="l-con-top-area">
                <div class="center-ct">
                    <div class="l-con-top-tit">공지사항 <span>Notice</span></div>
                    <form id="" name="" method="" action="">
                        <div class="c-search-box">
                            <input type="text" id="" name="" class="c-search-input" placeholder="검색어를 입력하세요">
                            <input type="button" value="검색" class="c-search-btn">
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        noticeListHtml += `
            <div class="l-con-main-area">
                <div class="center-ct">
                    <div class="c-table-area">
                        <table class="c-table">
                            <colgroup>
                                <col width="*" class="th00">
                                <col width="120" class="th01">
                            </colgroup>
                            <tbody>
        `;
        
        //공지사항 목록
        noticeListHtml += `
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr onclick="openNoticeDetailLayer(this);">
                                    <td class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</td>
                                    <td class="th01 date">2023-06-19</td>
                                </tr>
                                <tr>
                                    <td colspan="2" class="th00 empty">등록된 공지사항이 없습니다.</td>
                                </tr>
        `;
        
        noticeListHtml += `
                            </tbody>
                        </table>
                    </div>
                    <div class="c-paging-area">
                        <ul class="c-paging">
        `;
        
        //공지사항 목록 페이징
        noticeListHtml += `
                            <li class="prev-arrow disabled">
                                <a href="#"></a>
                            </li>
                            <li class="on">
                                <a href="#">1</a>
                            </li>
                            <li>
                                <a href="#">2</a>
                            </li>
                            <li>
                                <a href="#">3</a>
                            </li>
                            <li>
                                <a href="#">4</a>
                            </li>
                            <li>
                                <a href="#">5</a>
                            </li>
                            <li class="next-arrow">
                                <a href="#"></a>
                            </li>
        `;
        
        noticeListHtml += `
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        $("#notice-layer").find(".l-notice-list").html(noticeListHtml);
    }
    
    $("#notice-layer").find(".l-notice-detail").html("");
    
    $("#notice-layer").find(".l-notice-detail").removeClass("on");
    $("#notice-layer").find(".l-notice-list").addClass("on");
    
    $("#notice-layer").addClass("on");
    
    let scrollTop = parseInt($(document).scrollTop());

    $("body").css("top", -scrollTop + "px");

    $("body").addClass("scroll-disable").on('scroll touchmove', function(event) {
        event.preventDefault();
    });
}

//공지사항 상세창 열기
function openNoticeDetailLayer(obj) {
    //타이틀
    let noticeDetailHtml = `
        <div class="l-con-top-area only-pc">
            <div class="center-ct">
                <div class="l-con-top-tit">공지사항 <span>Notice</span></div>
            </div>
        </div>
    `;
    
    noticeDetailHtml += `
        <div class="l-con-main-area">
            <div class="center-ct">
                <div class="c-table-area">
                    <table class="c-table">
                        <colgroup>
                            <col width="*" class="th00">
                        </colgroup>
                        <tbody>
    `;
    
    //공지사항 상세정보
    noticeDetailHtml += `
                            <tr>
                                <th class="th00 tit c-left">인천 라이브 버스 공지사항 제목입니다.</th>
                            </tr>
                            <tr>
                                <td class="th00 con c-left">인천 라이브 버스 공지사항 내용입니다.<br>인천 라이브 버스 공지사항 내용입니다.<br>인천 라이브 버스 공지사항 내용입니다.<br>인천 라이브 버스 공지사항 내용입니다.<br>인천 라이브 버스 공지사항 내용입니다.</td>
                            </tr>
                            <tr>
                                <th class="th00 date c-right">작성일 2023-06-19</th>
                            </tr>
    `;
    
    noticeDetailHtml += `
                        </tbody>
                    </table>
                </div>
                <div class="c-btn-area">
                    <button type="button" class="c-btn01" onclick="openNoticeListLayer(this);">
                        <span>목록</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    $("#notice-layer").find(".l-notice-detail").html(noticeDetailHtml);
    
    $("#notice-layer").find(".l-notice-list").removeClass("on");
    $("#notice-layer").find(".l-notice-detail").addClass("on");
    
    $("#notice-layer").addClass("on");
    
    let scrollTop = parseInt($(document).scrollTop());

    $("body").css("top", -scrollTop + "px");

    $("body").addClass("scroll-disable").on('scroll touchmove', function(event) {
        event.preventDefault();
    });
}

//노선안내창 열기
function openRouteGuideLayer(obj) {
    //타이틀 + 검색창
    let routeGuideHtml = `
        <div class="l-con-top-area">
            <div class="center-ct">
                <div class="l-con-top-tit">노선안내 <span>Route information</span></div>
                <form id="" name="" method="" action="">
                    <div class="c-search-box">
                        <input type="text" id="" name="" class="c-search-input" placeholder="노선번호를 입력하세요">
                        <input type="button" value="검색" class="c-search-btn">
                    </div>
                </form>
            </div>
        </div>
    `;
    
    routeGuideHtml += `
        <div class="l-con-main-area">
            <div class="center-ct">
                <div class="c-table-area">
                    <table class="c-table">
                        <colgroup>
                            <col width="*" class="th00">
                            <col width="120" class="th01">
                            <col width="120" class="th02">
                            <col width="120" class="th03">
                            <col width="120" class="th04">
                        </colgroup>
                        <thead>
                            <tr>
                                <th class="th00">노선번호<br>(기점 <span class="direct"></span> 종점)</th>
                                <th class="th01"></th>
                                <th class="th02">기점시간</th>
                                <th class="th03">회차시간</th>
                                <th class="th04">배차간격<br>(분)</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    //노선 목록 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
    routeGuideHtml += `
                            <tr>
                                <td rowspan="3" class="th00 c-left">
                                    <div class="type skyblue-item">1</div>
                                    <div class="stop">(진웅종점 <span class="direct"></span> 인천성모병원종점지주차장)</div>
                                </td>
                                <td class="th01 kind">평일</td>
                                <td class="th02 num">05:00 ~ 22:40</td>
                                <td class="th03 num">05:00 ~ 23:20</td>
                                <td class="th04 num">14 ~ 19</td>
                            </tr>
                            <tr>
                                <td class="th01 kind">토요일</td>
                                <td class="th02 num">05:00 ~ 22:40</td>
                                <td class="th03 num">05:00 ~ 23:20</td>
                                <td class="th04 num">19 ~ 24</td>
                            </tr>
                            <tr>
                                <td class="th01 kind">공휴일</td>
                                <td class="th02 num">05:00 ~ 22:40</td>
                                <td class="th03 num">05:00 ~ 23:20</td>
                                <td class="th04 num">22 ~ 28</td>
                            </tr>
                            <tr>
                                <td rowspan="3" class="th00 c-left">
                                    <div class="type green-item">10<span>(강화)</span></div>
                                    <div class="stop">(강화터미널 <span class="direct"></span> 돌머리 (대산종점))</div>
                                </td>
                                <td class="th01 kind">평일</td>
                                <td class="th02 num">08:25 ~ 20:40</td>
                                <td class="th03 num">08:25 ~ 21:25</td>
                                <td class="th04 num">30 ~ 120</td>
                            </tr>
                            <tr>
                                <td class="th01 kind">토요일</td>
                                <td class="th02 num">08:25 ~ 20:40</td>
                                <td class="th03 num">08:25 ~ 21:25</td>
                                <td class="th04 num">30 ~ 120</td>
                            </tr>
                            <tr>
                                <td class="th01 kind">공휴일</td>
                                <td class="th02 num">08:25 ~ 20:40</td>
                                <td class="th03 num">08:25 ~ 21:25</td>
                                <td class="th04 num">30 ~ 120</td>
                            </tr>
                            <tr>
                                <td rowspan="3" class="th00 c-left">
                                    <div class="type red-item">1000</div>
                                    <div class="stop">(경남아너스빌 <span class="direct"></span> 서울역)</div>
                                </td>
                                <td class="th01 kind">평일</td>
                                <td class="th02 num">05:00 ~ 23:30</td>
                                <td class="th03 num">06:10 ~ 00:30</td>
                                <td class="th04 num">25 ~ 35</td>
                            </tr>
                            <tr>
                                <td class="th01 kind">토요일</td>
                                <td class="th02 num">05:00 ~ 23:30</td>
                                <td class="th03 num">06:10 ~ 00:30</td>
                                <td class="th04 num">25 ~ 35</td>
                            </tr>
                            <tr>
                                <td class="th01 kind">공휴일</td>
                                <td class="th02 num">05:00 ~ 23:30</td>
                                <td class="th03 num">06:10 ~ 00:30</td>
                                <td class="th04 num">25 ~ 35</td>
                            </tr>
                            <tr>
                                <td colspan="5" class="th00 empty">노선정보가 없습니다.</td>
                            </tr>
    `;
    
    routeGuideHtml += `
                        </tbody>
                    </table>
                </div>
                <div class="c-paging-area">
                    <ul class="c-paging">
    `;
    
    //노선 목록 페이징
    routeGuideHtml += `
                        <li class="prev-arrow disabled">
                            <a href="#"></a>
                        </li>
                        <li class="on">
                            <a href="#">1</a>
                        </li>
                        <li>
                            <a href="#">2</a>
                        </li>
                        <li>
                            <a href="#">3</a>
                        </li>
                        <li>
                            <a href="#">4</a>
                        </li>
                        <li>
                            <a href="#">5</a>
                        </li>
                        <li class="next-arrow">
                            <a href="#"></a>
                        </li>
    `;
    
    routeGuideHtml += `
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    $("#route-guide-layer").find(".l-route-guide").html(routeGuideHtml);
    
    $("#route-guide-layer").find(".l-route-guide").addClass("on");
    
    $("#route-guide-layer").addClass("on");
    
    let scrollTop = parseInt($(document).scrollTop());

    $("body").css("top", -scrollTop + "px");

    $("body").addClass("scroll-disable").on('scroll touchmove', function(event) {
        event.preventDefault();
    });
}

//요금안내창 열기
function openPriceGuideLayer(obj) {
    //타이틀
    let priceGuideHtml = `
        <div class="l-con-top-area only-pc">
            <div class="center-ct">
                <div class="l-con-top-tit">요금안내 <span>Rate information</span></div>
            </div>
        </div>
    `;
    
    priceGuideHtml += `
        <div class="l-con-main-area">
            <div class="center-ct">
                <div class="c-table-area">
                    <table class="c-table">
                        <colgroup>
                            <col width="*" class="th00">
                            <col width="*" class="th01">
                            <col width="120" class="th02">
                            <col width="120" class="th03">
                            <col width="120" class="th04">
                        </colgroup>
                        <thead>
                            <tr>
                                <th colspan="2" class="th00">구분</th>
                                <th class="th02"></th>
                                <th class="th03">카드</th>
                                <th class="th04">현금</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    //요금 목록
    priceGuideHtml += `
                            <tr>
                                <td rowspan="6" class="th00">일반버스</td>
                                <td rowspan="3" class="th01">간선형</td>
                                <td class="th02 kind">일반</td>
                                <td class="th03 num">1,250</td>
                                <td class="th04 num">1,300</td>
                            </tr>
                            <tr>
                                <td class="th02 kind">청소년</td>
                                <td class="th03 num">870</td>
                                <td class="th04 num">900</td>
                            </tr>
                            <tr>
                                <td class="th02 kind">어린이</td>
                                <td class="th03 num">500</td>
                                <td class="th04 num">500</td>
                            </tr>
                            <tr>
                                <td rowspan="3" class="th01">지선형</td>
                                <td class="th02 kind">일반</td>
                                <td class="th03 num">950</td>
                                <td class="th04 num">1,000</td>
                            </tr>
                            <tr>
                                <td class="th02 kind">청소년</td>
                                <td class="th03 num">600</td>
                                <td class="th04 num">700</td>
                            </tr>
                            <tr>
                                <td class="th02 kind">어린이</td>
                                <td class="th03 num">350</td>
                                <td class="th04 num">400</td>
                            </tr>
                            <tr>
                                <td colspan="2" rowspan="3" class="th00">공항버스 (직행좌석)</td>
                                <td class="th02 kind">일반</td>
                                <td class="th03 num">2,650</td>
                                <td class="th04 num">2,650</td>
                            </tr>
                            <tr>
                                <td class="th02 kind">청소년</td>
                                <td class="th03 num">1,500</td>
                                <td class="th04 num">1,500</td>
                            </tr>
                            <tr>
                                <td class="th02 kind">어린이</td>
                                <td class="th03 num">1,100</td>
                                <td class="th04 num">1,100</td>
                            </tr>
    `;
    
    priceGuideHtml += `
                        </tbody>
                    </table>
                </div>
                <div class="c-notice-area">
                    <div class="c-notice-tit">거리비례제 시행</div>
                    <div class="c-notice-con">
                        <div class="con-item"><span>좌석버스</span> : 10km 내 기본, 10~40km (5km 마다 100원 추가), 40km 초과 (100원)</div>
                        <div class="con-item"><span>M버스</span> : 30km 내 기본, 30~60km (5km 마다 100원 추가), 60km 초과 (100원)</div>
                        <div class="con-item"><span>지하철</span> : 10km 내 기본, 10~50km (5km 마다 100원 추가), 50km 초과 (8km 마다 100원 추가)</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $("#price-guide-layer").find(".l-price-guide").html(priceGuideHtml);
    
    $("#price-guide-layer").find(".l-price-guide").addClass("on");
    
    $("#price-guide-layer").addClass("on");
    
    let scrollTop = parseInt($(document).scrollTop());

    $("body").css("top", -scrollTop + "px");

    $("body").addClass("scroll-disable").on('scroll touchmove', function(event) {
        event.preventDefault();
    });
}

//맵 통합검색창 열기
function openSearchLayer(obj) {
    setMapListTab($(".map-list-area").find(".map-list-tab").find(".c-tab").children("li[data-tab-type='list'][data-tab-name='search']"));
    
    $(".map-list-area").addClass("on");
    
    if ($(".map-info-area").find(".close-btn2").length > 0) {
        $(".map-info-area").find(".close-btn2").trigger("click");
    }
}

//맵 버스&정류장 정보창 열기
function openMapInfoLayer(type, obj) {
    if (type == "route") {
        //노선 정보일 경우
        $(".map-menu-list>li[data-menu-type='position']").css("display", "none");
        $(".map-menu-list>li[data-menu-type='position']").children(".map-menu-item").removeClass("on");
        
        setRouteInfo(obj);
    } else if (type == "bus") {
        //버스 정보일 경우
        $(".map-menu-list>li[data-menu-type='position']").css("display", "");
        $(".map-menu-list>li[data-menu-type='position']").children(".map-menu-item").addClass("on");
        
        setBusInfo(obj);
    } else if (type == "station") {
        //정류장 정보일 경우
        $(".map-menu-list>li[data-menu-type='position']").css("display", "none");
        $(".map-menu-list>li[data-menu-type='position']").children(".map-menu-item").removeClass("on");
        
        setStationInfo(obj);
    }
    
    $(".map-list-area").removeClass("on");
    $(".map-info-area").removeClass("show");
    $(".map-info-area").addClass("on");
}

//맵 레이어창 열기
function openMapMenuLayer(obj) {
    if ($(obj).hasClass("on")) {
        $(obj).closest(".map-right-area").css("z-index", "");
        
        $(obj).removeClass("on")
    } else {
        $(obj).closest(".map-right-area").css("z-index", 99);
        
        $(obj).addClass("on")
    }
}

//맵 즐겨찾기창 열기
function openBookmarkLayer(obj) {
    setMapListTab($(".map-list-area").find(".map-list-tab").find(".c-tab").children("li[data-tab-type='list'][data-tab-name='bookmark']"));

    $(".map-list-area").addClass("on");
    
    if ($(".map-info-area").find(".close-btn2").length > 0) {
        $(".map-info-area").find(".close-btn2").trigger("click");
    }
}

//레이어창 닫기
function closeLayer(obj) {
    let objId = $(obj).closest(".l-area").attr("id");
    
    $(obj).closest(".l-area").removeClass("on");
    
    if (objId == "notice-layer") {
        //공지사항창일 경우
        $(obj).closest(".l-area").find(".l-notice-list").html("");
        $(obj).closest(".l-area").find(".l-notice-detail").html("");

        $(obj).closest(".l-area").find(".l-notice-list").removeClass("on");
        $(obj).closest(".l-area").find(".l-notice-detail").removeClass("on");
    } else if (objId == "route-guide-layer") {
        //노선안내창일 경우
        $(obj).closest(".l-area").find(".l-route-guide").html("");

        $(obj).closest(".l-area").find(".l-route-guide").removeClass("on");
    } else if (objId == "price-guide-layer") {
        //요금안내창일 경우
        $(obj).closest(".l-area").find(".l-price-guide").html("");

        $(obj).closest(".l-area").find(".l-price-guide").removeClass("on");
    }
    
    if ($(".l-area.on").length == 0) {
        $("body").removeClass("scroll-disable").off('scroll touchmove');

        let scrollTop = Math.abs(parseInt($("body").css("top")));

        $("html,body").animate({scrollTop: scrollTop}, 0);
    }
}

//맵 통합검색창 닫기
function closeSearchLayer(obj) {
    $(".map-list-area").removeClass("on");
}

//맵 버스&정류장 정보창 닫기
function closeMapInfoLayer(obj) {
    $(".map-menu-list>li[data-menu-type='position']").css("display", "none");
    $(".map-menu-list>li[data-menu-type='position']").children(".map-menu-item").removeClass("on");
    
    $(".map-info-item").html("");
    
    $(".map-info-area").removeClass("show");
    $(".map-info-area").removeClass("on");
}

//맵 레이어창 닫기
function closeMapMenuLayer(obj) {
    $(obj).closest(".map-right-area").css("z-index", "");
    
    $(obj).closest(".map-menu-layer-area").prev(".map-menu-item").removeClass("on");
}

//맵 즐겨찾기창 닫기
function closeBookmarkLayer(obj) {
    $(".map-list-area").removeClass("on");
}

//지도 설정
function setMapInit() {
    if ($("#mapMainArea").length > 0) {
        var mapContainer = document.getElementById('mapMainArea'), //지도를 표시할 div
        mapOption = {
            center: new kakao.maps.LatLng(37.382294,126.656398), //지도의 중심좌표
            level: 1 //지도의 확대 레벨
        };

        //지도를 표시할 div와 지도 옵션으로 지도를 생성합니다
        map = new kakao.maps.Map(mapContainer, mapOption); 

        //marker
        var content = document.createElement('div');
        //on : 마커를 클릭했을 경우
        content.className = 'busMakerArea on';
        //data-bus-id : 버스번호
        content.setAttribute('data-bus-id','인천00가1111');
        //data-bus-type : 버스종류 (skyblue : 간선버스, red : 광역버스&공항버스, green : 지선버스&마을버스, blue : 급행버스, orange : 좌석버스)
        content.setAttribute('data-bus-type','red');
        //data-lowbus-flag : 저상버스여부
        content.setAttribute('data-lowbus-flag','Y');
        var contentImg = document.createElement('div');
        contentImg.className = 'busMakerImg';
        var contentTxt = document.createElement('div');
        contentTxt.className = 'busMakerTxt';
        contentTxt.innerHTML = 'M6450';
        content.appendChild(contentImg);
        content.appendChild(contentTxt);
        contentImg.style.cssText = 'transform: rotate(40deg);';

        var positions = [
            new kakao.maps.LatLng(37.3821206,126.6567016),
            new kakao.maps.LatLng(37.3820496,126.6565872), 
            new kakao.maps.LatLng(37.3818029,126.6563552)
        ]

        var customOverlay = new kakao.maps.CustomOverlay({
            position: positions[0],
            content: content,
            map: map
        });

        //WARNNING 원래 이렇게 접근하는 건 위험합니다.
        var customOverlayElement = content.parentNode;
        //이 top, left 속성을 트랜지션 등록하는 것도 위험하긴 합니다. 차후에 바뀔가능성이 있습니다.
        customOverlayElement.style.transition = 'top 2s, left 2s';

        var index = 0;
        setInterval(function() {
            customOverlay.setPosition(positions[++index % 3]);
        }, 2000);
    }
}

