(function(window,undefined){'use strict';var AudioPlayer=(function(){var docTitle=document.title,player=document.getElementById('ap'),playBtn,playSvg,playSvgPath,prevBtn,nextBtn,plBtn,repeatBtn,volumeBtn,progressBar,preloadBar,curTime,durTime,trackTitle,audio,index=0,playList,volumeBar,wheelVolumeValue=0,volumeLength,repeating=!1,seeking=!1,rightClick=!1,apActive=!1,pl,plUl,plLi,tplList='<li class="pl-list" data-track="{count}">'+'<div class="pl-list__track">'+'<div class="pl-list__icon"></div>'+'<div class="pl-list__eq">'+'<div class="eq">'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'</div>'+'</div>'+'</div>'+'<div class="pl-list__title">{title}</div>'+'</li>',settings={volume:.7,changeDocTitle:!0,confirmClose:!0,autoPlay:!1,buffered:!0,playList:[]};function init(options){if(!('classList' in document.documentElement)){return!1}if(apActive||player===null){return'Player already init'}settings=extend(settings,options);playBtn=player.querySelector('.ap__controls--toggle');playSvg=playBtn.querySelector('.icon-play');playSvgPath=playSvg.querySelector('path');prevBtn=player.querySelector('.ap__controls--prev');nextBtn=player.querySelector('.ap__controls--next');repeatBtn=player.querySelector('.ap__controls--repeat');volumeBtn=player.querySelector('.volume-btn');plBtn=player.querySelector('.ap__controls--playlist');curTime=player.querySelector('.track__time--current');durTime=player.querySelector('.track__time--duration');trackTitle=player.querySelector('.track__title');progressBar=player.querySelector('.progress__bar');preloadBar=player.querySelector('.progress__preload');volumeBar=player.querySelector('.volume__bar');playList=settings.playList;playBtn.addEventListener('click',playToggle,!1);volumeBtn.addEventListener('click',volumeToggle,!1);repeatBtn.addEventListener('click',repeatToggle,!1);progressBar.closest('.progress-container').addEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').addEventListener('mousemove',seek,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').addEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').addEventListener('mousemove',setVolume);volumeBar.closest('.volume').addEventListener(wheel(),setVolume,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);prevBtn.addEventListener('click',prev,!1);nextBtn.addEventListener('click',next,!1);apActive=!0;renderPL();plBtn.addEventListener('click',plToggle,!1);audio=new Audio();audio.volume=settings.volume;audio.preload='none';audio.addEventListener('error',errorHandler,!1);audio.addEventListener('timeupdate',timeUpdate,!1);audio.addEventListener('ended',doEnd,!1);volumeBar.style.height=audio.volume*100+'%';volumeLength=volumeBar.css('height');if(settings.confirmClose)if(isEmptyList()){return!1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;if(settings.autoPlay){audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plLi[index].classList.add('pl-list--current')}}function changeDocumentTitle(title){if(settings.changeDocTitle){if(title){document.title=title}else{document.title=docTitle}}}function beforeUnload(evt){if(!audio.paused){var message='Music still playing';evt.returnValue=message;return message}}function errorHandler(evt){if(isEmptyList()){return}var mediaError={'1':'MEDIA_ERR_ABORTED','2':'MEDIA_ERR_NETWORK','3':'MEDIA_ERR_DECODE','4':'MEDIA_ERR_SRC_NOT_SUPPORTED'};audio.pause();curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));plLi[index]&&plLi[index].classList.remove('pl-list--current');changeDocumentTitle();throw new Error('Houston we have a problem: '+mediaError[evt.target.error.code])}function updatePL(addList){if(!apActive){return'Player is not yet initialized'}if(!Array.isArray(addList)){return}if(addList.length===0){return}var count=playList.length;var html=[];playList.push.apply(playList,addList);addList.forEach(function(item){html.push(tplList.replace('{count}',count++).replace('{title}',item.title))});if(plUl.querySelector('.pl-list--empty')){plUl.removeChild(pl.querySelector('.pl-list--empty'));audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title}plUl.insertAdjacentHTML('beforeEnd',html.join(''));plLi=pl.querySelectorAll('li')}function renderPL(){var html=[];playList.forEach(function(item,i){html.push(tplList.replace('{count}',i).replace('{title}',item.title))});pl=create('div',{'className':'pl-container','id':'pl','innerHTML':'<ul class="pl-ul">'+(!isEmptyList()?html.join(''):'<li class="pl-list--empty">PlayList is empty</li>')+'</ul>'});player.parentNode.insertBefore(pl,player.nextSibling);plUl=pl.querySelector('.pl-ul');plLi=plUl.querySelectorAll('li');pl.addEventListener('click',listHandler,!1)}function listHandler(evt){evt.preventDefault();if(evt.target.matches('.pl-list__title')||evt.target.matches('.pl-list__track')||evt.target.matches('.pl-list__icon')||evt.target.matches('.pl-list__eq')||evt.target.matches('.eq')){var current=parseInt(evt.target.closest('.pl-list').getAttribute('data-track'),10);if(index!==current){index=current;play(current)}else{playToggle()}}else{if(!!evt.target.closest('.pl-list__remove')){var parentEl=evt.target.closest('.pl-list');var isDel=parseInt(parentEl.getAttribute('data-track'),10);playList.splice(isDel,1);parentEl.closest('.pl-ul').removeChild(parentEl);plLi=pl.querySelectorAll('li');[].forEach.call(plLi,function(el,i){el.setAttribute('data-track',i)});if(!audio.paused){if(isDel===index){play(index)}}else{if(isEmptyList()){clearAll()}else{if(isDel===index){if(isDel>playList.length-1){index-=1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;progressBar.style.width=0}}}if(isDel<index){index--}}}}function plActive(){if(audio.paused){plLi[index].classList.remove('pl-list--current');return}var current=index;for(var i=0,len=plLi.length;len>i;i++){plLi[i].classList.remove('pl-list--current')}plLi[current].classList.add('pl-list--current')}function play(currentIndex){if(isEmptyList()){return clearAll()}index=(currentIndex+playList.length)%playList.length;audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plActive()}function prev(){play(index-1)}function next(){play(index+1)}function isEmptyList(){return playList.length===0}function clearAll(){audio.pause();audio.src='';trackTitle.innerHTML='queue is empty';curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));if(!plUl.querySelector('.pl-list--empty')){plUl.innerHTML='<li class="pl-list--empty">PlayList is empty</li>'}changeDocumentTitle()}function playToggle(){if(isEmptyList()){return}if(audio.paused){if(audio.currentTime===0){notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'))}else{changeDocumentTitle();audio.pause();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'))}plActive()}function volumeToggle(){if(audio.muted){if(parseInt(volumeLength,10)===0){volumeBar.style.height=settings.volume*100+'%';audio.volume=settings.volume}else{volumeBar.style.height=volumeLength}audio.muted=!1;volumeBtn.classList.remove('has-muted')}else{audio.muted=!0;volumeBar.style.height=0;volumeBtn.classList.add('has-muted')}}function repeatToggle(){if(repeatBtn.classList.contains('is-active')){repeating=!1;repeatBtn.classList.remove('is-active')}else{repeating=!0;repeatBtn.classList.add('is-active')}}function plToggle(){plBtn.classList.toggle('is-active');pl.classList.toggle('h-show')}function timeUpdate(){if(audio.readyState===0)return;var barlength=Math.round(audio.currentTime*(100/audio.duration));progressBar.style.width=barlength+'%';var curMins=Math.floor(audio.currentTime/60),curSecs=Math.floor(audio.currentTime-curMins*60),mins=Math.floor(audio.duration/60),secs=Math.floor(audio.duration-mins*60);(curSecs<10)&&(curSecs='0'+curSecs);(secs<10)&&(secs='0'+secs);curTime.innerHTML=curMins+':'+curSecs;durTime.innerHTML=mins+':'+secs;if(settings.buffered){var buffered=audio.buffered;if(buffered.length){var loaded=Math.round(100*buffered.end(0)/audio.duration);preloadBar.style.width=loaded+'%'}}}function shuffle(){if(shuffle){index=Math.round(Math.random()*playList.length)}}function doEnd(){if(index===playList.length-1){if(!repeating){audio.pause();plActive();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));return}else{play(0)}}else{play(index+1)}}function moveBar(evt,el,dir){var value;if(dir==='horizontal'){value=Math.round(((evt.clientX-el.offset().left)+window.pageXOffset)*100/el.parentNode.offsetWidth);el.style.width=value+'%';return value}else{if(evt.type===wheel()){value=parseInt(volumeLength,10);var delta=evt.deltaY||evt.detail||-evt.wheelDelta;value=(delta>0)?value-10:value+10}else{var offset=(el.offset().top+el.offsetHeight)-window.pageYOffset;value=Math.round((offset-evt.clientY))}if(value>100)value=wheelVolumeValue=100;if(value<0)value=wheelVolumeValue=0;volumeBar.style.height=value+'%';return value}}function handlerBar(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;seek(evt)}function handlerVol(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;setVolume(evt)}function seek(evt){if(seeking&&rightClick===!1&&audio.readyState!==0){var value=moveBar(evt,progressBar,'horizontal');audio.currentTime=audio.duration*(value/100)}}function seekingFalse(){seeking=!1}function setVolume(evt){evt.preventDefault();volumeLength=volumeBar.css('height');if(seeking&&rightClick===!1||evt.type===wheel()){var value=moveBar(evt,volumeBar.parentNode,'vertical')/100;if(value<=0){audio.volume=0;audio.muted=!0;volumeBtn.classList.add('has-muted')}else{if(audio.muted)audio.muted=!1;audio.volume=value;volumeBtn.classList.remove('has-muted')}}}function notify(title,attr){if(!settings.notification){return}if(window.Notification===undefined){return}attr.tag='AP music player';window.Notification.requestPermission(function(access){if(access==='granted'){var notice=new Notification(title.substr(0,110),attr);setTimeout(notice.close.bind(notice),5000)}})}function destroy(){if(!apActive)return;if(settings.confirmClose){window.removeEventListener('beforeunload',beforeUnload,!1)}playBtn.removeEventListener('click',playToggle,!1);volumeBtn.removeEventListener('click',volumeToggle,!1);repeatBtn.removeEventListener('click',repeatToggle,!1);plBtn.removeEventListener('click',plToggle,!1);progressBar.closest('.progress-container').removeEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').removeEventListener('mousemove',seek,!1);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').removeEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').removeEventListener('mousemove',setVolume);volumeBar.closest('.volume').removeEventListener(wheel(),setVolume);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);prevBtn.removeEventListener('click',prev,!1);nextBtn.removeEventListener('click',next,!1);audio.removeEventListener('error',errorHandler,!1);audio.removeEventListener('timeupdate',timeUpdate,!1);audio.removeEventListener('ended',doEnd,!1);pl.removeEventListener('click',listHandler,!1);pl.parentNode.removeChild(pl);audio.pause();apActive=!1;index=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));volumeBtn.classList.remove('has-muted');plBtn.classList.remove('is-active');repeatBtn.classList.remove('is-active')}function wheel(){var wheel;if('onwheel' in document){wheel='wheel'}else if('onmousewheel' in document){wheel='mousewheel'}else{wheel='MozMousePixelScroll'}return wheel}function extend(defaults,options){for(var name in options){if(defaults.hasOwnProperty(name)){defaults[name]=options[name]}}return defaults}function create(el,attr){var element=document.createElement(el);if(attr){for(var name in attr){if(element[name]!==undefined){element[name]=attr[name]}}}return element}function getTrack(index){return playList[index]}Element.prototype.offset=function(){var el=this.getBoundingClientRect(),scrollLeft=window.pageXOffset||document.documentElement.scrollLeft,scrollTop=window.pageYOffset||document.documentElement.scrollTop;return{top:el.top+scrollTop,left:el.left+scrollLeft}};Element.prototype.css=function(attr){if(typeof attr==='string'){return getComputedStyle(this,'')[attr]}else if(typeof attr==='object'){for(var name in attr){if(this.style[name]!==undefined){this.style[name]=attr[name]}}}};window.Element&&function(ElementPrototype){ElementPrototype.matches=ElementPrototype.matches||ElementPrototype.matchesSelector||ElementPrototype.webkitMatchesSelector||ElementPrototype.msMatchesSelector||function(selector){var node=this,nodes=(node.parentNode||node.document).querySelectorAll(selector),i=-1;while(nodes[++i]&&nodes[i]!=node);return!!nodes[i]}}(Element.prototype);window.Element&&function(ElementPrototype){ElementPrototype.closest=ElementPrototype.closest||function(selector){var el=this;while(el.matches&&!el.matches(selector))el=el.parentNode;return el.matches?el:null}}(Element.prototype);return{init:init,update:updatePL,destroy:destroy,getTrack:getTrack}})();window.AP=AudioPlayer})(window)
AP.init({
  playList: [
    {'title': 'Gökhan Türkmen & Birkan Nasuhoğlu - Gülmedi Kader', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LyFyf-ejqFiSvx3MshK%2F-LyFylg77-7Una_5m4sD%2Fgulmedikader.mp3?alt=media&token=c224efaf-864d-44f4-a250-ffd907fbcc2e'},
    {'title': 'MANGA ft. Ahmet Kural & Murat Cemcir - Baba Parası Film Müziği', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LyAvi6N0dfh9FmuZ2xr%2F-LyAyt99x-NmChVVq-15%2Fbabaparasi.mp3?alt=media&token=5192017c-9796-48d9-8d92-00f0ba395f7b'},
    {'title': 'Pera - Seni Seviyorum', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LyAvi6N0dfh9FmuZ2xr%2F-LyAzGkpy6wDLMlDNbIw%2Fseniseviyorum.mp3?alt=media&token=5ff32582-5eed-4410-938b-4741758f2b76'},
    {'title': 'Pınar Soykan - İkimiz Adına', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LyAvi6N0dfh9FmuZ2xr%2F-LyAzqCArKnznMQ8NyfB%2Fikimizadina.mp3?alt=media&token=09890354-a8e5-4fa3-bbb7-9ce195aaa910'},
    {'title': 'Soner Arıca - Bambaşka', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Ly4anQ-XSemN7XdOJUP%2F-Ly4aueZHgsYqNbI89x8%2Fbambaska.mp3?alt=media&token=88f94fa3-a0c2-42f0-9668-677eb01bfb12'},
    {'title': 'Zeynep Bastık - Uslanmıyor Bu', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Ly4byHulCzbEot3nejw%2F-Ly4cot2lXGLgFYc9aSa%2Fuslanmiyorbu.mp3?alt=media&token=f73e08ea-1226-488c-ad52-1beddcd92bdc'},
    {'title': 'Emre Elçioğlu - Kırmızı Yazma', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Ly4byHulCzbEot3nejw%2F-Ly4c1aKokXRnmZLi75-%2Fkirmiziyazma.mp3?alt=media&token=d5f030e5-b48f-4e44-9516-43db572eb047'},
    {'title': 'Ali Kınık ft. Asena İrmikci - Bildiğin Gibi Değil', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lxqb9WurgS3LDA8vWmo%2F-LxqbJT6TRxw6IOr-HGE%2Fbilgidingibidegil.mp3?alt=media&token=aa1a1420-e64c-4545-b65c-ab3fe4c8b5ae'},
    {'title': 'Ayla Çelik & Beyazıt Öztürk - Parti', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lxqb9WurgS3LDA8vWmo%2F-LxqbmzoT7ZeDvtkRIwT%2Fparti.mp3?alt=media&token=d0e99124-d89b-4c98-9a37-7b13029024bc'},
    {'title': 'Defne Samyeli - Ağla Ağla', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LxBo-5SOEuXXe3UIuLa%2F-LxBoXe2pVaejNIyYbjN%2Faglagla.mp3?alt=media&token=2fba2713-3bc6-4b78-b987-c8b52fde0596'},
    {'title': 'Burcu Güneş - Kıyasıya', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LxBo-5SOEuXXe3UIuLa%2F-LxBo8M-O1nvsLHYqD5x%2Fkiyasiya.mp3?alt=media&token=e7c84ced-5e82-4387-816b-0fef69bf8a32'},
    {'title': 'Ceza - Beatcoin', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lx70Agxe5v1nnP6DTJ0%2F-Lx74Qlv3wmS_VHPHUgL%2Fbeatcoin.mp3?alt=media&token=9a6785ca-f741-430c-9f7c-d80904bd8c65'},
    {'title': 'Zakkum - Gülü Susuz', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwjfOAFDDkxcH9D2ILg%2F-LwjgMB_l4VUTwNXBBjB%2Fgulususuz.mp3?alt=media&token=9d985887-d55c-4257-ae6f-1fd4c1dcde6d'},
    {'title': 'Taladro ft. Cem Adrian - Unutmak İstemiyorum', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwjfOAFDDkxcH9D2ILg%2F-LwjgoRzWTO6Zlkrwi0I%2Funutmakistemiyorum.mp3?alt=media&token=f21a34b8-82ee-4974-a256-87cf95957e7f'},
    {'title': 'Şenay Lambaoğlu - Böyle Olmasını İstemezdim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwjfOAFDDkxcH9D2ILg%2F-Lwjfc4cHn53zwApJWLQ%2Fboyleolmasini.mp3?alt=media&token=32c43e78-293b-44ec-8abe-98a307c60109'},
    {'title': 'Dicle Olcay - Bu Saatten Sonra', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwjfOAFDDkxcH9D2ILg%2F-Lwjg-zfl9e17H4UzGI9%2Fbusaattensonra.mp3?alt=media&token=5e9ae6cf-e2b9-40b7-bc1a-708236d81569'},
    {'title': 'Mazhar Alanson - Yazan Aşık', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwjfOAFDDkxcH9D2ILg%2F-LwjhGrC8UaDQTf0YRV7%2Fyazanasik.mp3?alt=media&token=8c638fe3-8f5b-4c89-84ba-ba80bc60f9d9'},
    {'title': 'Gökhan Tepe - Asmalı', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwUgS-SocZ1VHMJfQUk%2F-LwUgb8PdVhM6hIpPF9a%2Fasmali.mp3?alt=media&token=a8d5fd73-eb1a-42e6-aa1c-93329598e094'},
    {'title': 'Ferhat Göçer - Geçmiyor Günler', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwUgS-SocZ1VHMJfQUk%2F-LwUh19gEia2tTLHyXnP%2Fgecmiyorgunler.mp3?alt=media&token=1709e466-9124-4580-98e7-1bc47033f55d'},
    {'title': 'Pinhani - Üzülmeyelim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwUgS-SocZ1VHMJfQUk%2F-LwUhNKybwVSzXEKYxDh%2Fuzulmeyelim.mp3?alt=media&token=42e1b64c-7a34-4dab-9f32-afbfd296d443'},
    {'title': 'Fatih Bulut - 15 Kişiye Saldırdım', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA3duvKHINAMoMRJCj%2F-LwA4bioKyW4SiXQz2pp%2F15kisiyes.mp3?alt=media&token=b8fc6444-c77b-47a5-b98c-ab4cf8bdeed8'},
    {'title': 'Koray Avcı - Yuh Yuh', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA7V0nohS311BhmqAo%2F-LwA7Wrl3kYFoxiTuJIw%2Fyuhyuh.mp3?alt=media&token=d293430c-a2b2-41b3-b49b-9452f4bda9dd'},
    {'title': 'Ozan Doğulu ft. Hera - Yanar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA7V0nohS311BhmqAo%2F-LwA7qF2SL0orVVqq5v5%2Fyanar.mp3?alt=media&token=b52414de-0418-4ae0-991c-b6b96f148591'},
    {'title': 'Berkay - İki Hece', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA3duvKHINAMoMRJCj%2F-LwA6_v2tUTLV4psPUJy%2Fikihece.mp3?alt=media&token=38b8e2e9-d165-4a3e-a973-e9c219f7e311'},
    {'title': 'Eli Türkoğlu - Bitmeyen Öyküm', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA3duvKHINAMoMRJCj%2F-LwA6Der07UhKfE_tyqW%2Fbitmeyenoykum.mp3?alt=media&token=a69ae7bc-8845-46a6-818f-521741eb0da5'},
    {'title': 'Ömür Gedik - Aramışsın', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA3duvKHINAMoMRJCj%2F-LwA5q785JZs7GpmhPVs%2Faramissin.mp3?alt=media&token=5391d105-0107-43e0-8e5e-22866dad485f'},
    {'title': 'Ersay Üner - Selam', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA3duvKHINAMoMRJCj%2F-LwA73JaS59k7ZXJgknh%2Fselam.mp3?alt=media&token=5c24c541-17c1-45f7-9abb-dc72b4f2a623'},
    {'title': 'İmera & Hüseyin Turan - Ağlar Gezerum', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LwA3duvKHINAMoMRJCj%2F-LwA5ElKNLKgnWw_FMzo%2Faglargezerum.mp3?alt=media&token=a7922248-0a04-4143-8884-73943a767455'},
    {'title': 'Cem Belevi - Buz Yanığı', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LvqP-ouCUTExvSq3nhQ%2F-LvqP51rxmaFcD23tImU%2Fbuzyanigi.mp3?alt=media&token=24eea195-276b-4da0-86ef-fa7d3cfcd692'},
    {'title': 'Bahadır Tatlıöz ve Diğerleri - Kına', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LvqP-ouCUTExvSq3nhQ%2F-LvqPTrj2OPfpTLVi5OD%2Fkina.mp3?alt=media&token=96ebdf20-f0c1-4094-ac0f-2c171b082516'},
    {'title': 'Yaprak Çamlıca - Masal Geceler', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LvWM5Z8_NGqeSqBIB_h%2F-LvWMbrHy1bU_LGO_9ZA%2Fmasalgeceler.mp3?alt=media&token=4ee8bd5b-fa7c-469b-9829-b82274ad8783'},
    {'title': 'Tan Taşçı - Git Gidebilirsen', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LvWM5Z8_NGqeSqBIB_h%2F-LvWNLzQJAsMxJa6pn-F%2Fgitgidebilirsen.mp3?alt=media&token=a926bdb5-cc01-4232-8676-253c64298567'},
    {'title': 'Özcan Deniz - Aşk', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LvWM5Z8_NGqeSqBIB_h%2F-LvWMCB8iPcVNzA4nE7w%2Fozcanask.mp3?alt=media&token=356f2e6a-f4b0-4035-a25b-8486ad26bf9d'},
    {'title': 'Tuğba Özerk - Hergele', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LvWM5Z8_NGqeSqBIB_h%2F-LvWMtFqszI1Gn1hOmHi%2Fhergele.mp3?alt=media&token=3f73630c-0e93-4d7a-bffa-5ae2a006a05e'},
    {'title': 'KimbuReyhan - Issız Duvarlar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Luy9ikQmiR2xhW7cD5b%2F-Luy9m9uVsB9AYuWU2jU%2Fissizduvarlar.mp3?alt=media&token=93d10ea7-5bff-4fdf-928a-7adaffd20cc5'},
  {'title': 'Hande Ünsal - Daha İyi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LubtVxnNS4lHf8YdJmK%2F-LubtdcAFm4Wpa5LZR_8%2Fdahaiyi.mp3?alt=media&token=c67ede8e-f7b9-44a1-a824-ec4cae5c0998' },
  {'title': 'Kahraman Deniz - Uzak Gelecek', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LuY5t9waKWwu7IQAr1F%2F-LuY6T0mtKb4n0YCoI0Q%2Fuzakgelecek.mp3?alt=media&token=1924edfe-adb7-48f8-a00b-60765595cf71' },
  {'title': 'Gökcan Sanlıman - Yeter', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LuY5t9waKWwu7IQAr1F%2F-LuY66uiEvDV96WZcz7P%2Fyeter.mp3?alt=media&token=da717d6c-427d-4b06-a568-1ca27c16f6a4' },
  {'title': 'Bengü - Günaydın', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LuInUmRDnkJLU0dHuTX%2F-LuIoJc3t6zmqTUf3LmM%2Fgunaydin.mp3?alt=media&token=0100abdd-ff57-443b-9ed5-09082dfafc93' },
  {'title': 'Gökhan Türkmen - Sır ', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LuInUmRDnkJLU0dHuTX%2F-LuInuwRgltJqQt_2hIo%2Fsir.mp3?alt=media&token=3eab0b45-853f-450f-839b-860fc73949e5' },
  {'title': 'Gülden - Yakarım İstanbulu', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LuInUmRDnkJLU0dHuTX%2F-LuInXLMHhQP3sHaLJS9%2Fyakarimistanbulu.mp3?alt=media&token=b46a51d6-b13e-4bfe-914b-3ef20f1e40e8' },
  {'title': 'Murat Dalkılıç - Afeta', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LuD2x75s0Up1VrPTWlg%2F-LuD3AcsnMjyVC6qlWAn%2Faftea.mp3?alt=media&token=21c0abbb-67b7-4a94-ab90-ec2bb075814b' },
  {'title': 'Derya Uluğ - Göremedim Bir De Sen Bak', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtzuKcagxIPA7h900zc%2F-LtzulYbRzfwE5PnbG2K%2Fgoremedimbidesen.mp3?alt=media&token=b577c9b9-95e6-4ad7-a518-1e741f7f7499' },
  {'title': 'Ceylan - Cennetim Ol', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtqDUXEGiGeoD_uP04t%2F-LtqDXiaUvnqEjosznQJ%2Fcennetimol.mp3?alt=media&token=08a7d419-ccba-41fa-a571-802a178619bb' },
  {'title': 'Haluk Levent - Sen Olasın', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lte4B1Eod7-iFT6VzPt%2F-Lte4Go8DhWTUyEXnrrY%2Fsenolasin.mp3?alt=media&token=e7378f3a-0e6a-4493-a91c-02bf8d603929' },
 {'title': 'Bora Duran - Başgan', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lt_BhuoQdhOyQ_0ByKV%2F-Lt_BmDsnCL1zc56v7tk%2Fbasgan.mp3?alt=media&token=192e675b-4754-4081-b537-4721696dcb42' },
  {'title': 'Mustafa Sandal & Zeynep Bastık - Mod', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtVr6xLyD97QrICAHU8%2F-LtVrIHqQw5CvoM4DSXv%2Fmod.mp3?alt=media&token=c6d0ad4b-0f64-41c0-bdb5-2992e9b99cf8' },
  {'title': 'Feride Hilal Akın - Kim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtGaIHHXRSPStcUybRP%2F-LtGbVgnRwiB-JetQL94%2Fkim.mp3?alt=media&token=3e5fd084-043b-414e-9fd6-b8054b03dc35' },
  {'title': 'Fatma Turgut & Can Baydar - Yangın Yeri', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtB8onx2UJk28iktayB%2F-LtB9uNi3uZTlmgIR7x7%2Fyanginyeri.mp3?alt=media&token=a5c377f4-c371-4a0e-9d9d-c9c366c49d48' },
  {'title': 'Eflatun - En Güzel Ben Sevdim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtGaIHHXRSPStcUybRP%2F-LtGakMfLMFCho54Zfdm%2Fenguzelbensevdim.mp3?alt=media&token=8d44d8a6-a881-4703-8c86-4ad7e912d06d' },
  {'title': 'Oğuz Berkay Fidan - Kül', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtBBBAg_ntsIPYbwoR6%2F-LtBC8rvTfi7-L-Yr_Bu%2Fkul.mp3?alt=media&token=463ea90b-feb5-42b2-91a8-cf4cd158adac' },
  {'title': 'Ümit Besen & Gülden - Değiştim', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtBCqZDUEDAvPdgAzK0%2F-LtBDV0rj-p0FN4nPFgo%2Fdegistim.mp3?alt=media&token=0de30d30-b020-498c-a967-5b8d4b22dd06' },
  {'title': 'Berdan Mardini - Aşktan Geberiyorum', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LtB8onx2UJk28iktayB%2F-LtB8sNA2ESC5Kje4BRZ%2Fasktangeberiyorum.mp3?alt=media&token=51703d37-2091-4c43-a015-ebfa9231f1ce' },
  {'title': 'Deniz Seki - Nereden Bileceksiniz', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-Lt0xYHgcSo4LBs_r-F-%2F-Lt0xabCKATvuoMUpv-Z%2Fneredenbileceksiniz.mp3?alt=media&token=294eaa5a-b267-49f6-a1b7-afa87d5e4e0d' },
  {'title': 'İskender Paydaş - Kağızman', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsvGq5pbViCVw-I4rym%2F-LsvGtMlL6mjrMldOkSK%2Fkagizman.mp3?alt=media&token=f968c0e6-7ceb-4695-840a-9c0b515c558b' },
  {'title': 'İkiye On Kala - Bütün Istanbul Biliyo', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsmzxSKbvBeUI_aUo96%2F-Lsn-5IEezLjkMZXJS5W%2Fbutunistanbul.mp3?alt=media&token=80529419-4097-4711-a61a-57c78d2455d7' },
  {'title': 'Manuş Baba - Onun Bir Sevdiği Var', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LshmbjHYV97e43vEUma%2F-LshmfR5-cGJgBbi09Qf%2Fonunbirsevdigivar.mp3?alt=media&token=8f870f44-fa47-4253-9e1c-7d4e7ef33c1e' },
  {'title': 'Tuğba Yurt - Taş Yürek', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LscfQiKKmA_5S2xG5hi%2F-LscgaZchvPh5Xti_n7P%2Ftasyurek.mp3?alt=media&token=89a7f0a5-9f99-425c-bc81-7835e310dbab' },
  {'title': 'Tuğba Yurt - Vurkaç', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LscfQiKKmA_5S2xG5hi%2F-LscfWG_rkZyyVBSXdMC%2Fvurkac.mp3?alt=media&token=8d56e04f-f26f-4c4e-8839-94ec88aa5ad7' },
  {'title': 'Aydın Kurtoğlu - Tek', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsSvGpmVXOqzTnWVKBF%2F-LsSvIjVxOmBfUKfoj6n%2Ftek.mp3?alt=media&token=80dba39f-4772-46f1-923c-0e951d98c8b0' },
  {'title': 'Gökçe - Bu Kalp', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsSykSvKQP6MbVqyBYs%2F-LsSymu4ozhapqFg36AP%2Fbukalp.mp3?alt=media&token=ff2ae573-f990-442b-bb0b-a3d74908f7ec' },
  {'title': 'Bilal SONSES - Neyim Olacaktın?', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsIujdJHlIIyVSckGrb%2F-LsIun1MCp9gzkhiwwn9%2Fneyimolacaktin.mp3?alt=media&token=d686b482-609d-47b9-9e27-0a983a389004' },
  {'title': 'Cem Adrian & Hande Mehan - Kum Gibi', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsNvzsHmm53ECGGl6DR%2F-LsNw5L8tIkbYqve16jj%2Fkumgibi.mp3?alt=media&token=ab27e330-3bc1-4920-8fb7-67ae92a5eb79' },
  {'title': 'Ceren Cennet - Kördüğüm', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsNvEoNqAD7fNIKO56S%2F-LsNvHiAFPJX1HRwO_LO%2Fkordugum.mp3?alt=media&token=bb3baacf-62a1-4d03-b404-6076ab9f9c0b' },
  {'title': 'Ebru Yaşar - Alev Alev', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrzRQOhj53jXurJv001%2F-LrzS0LrsMM_c-bHzBWO%2Falevalev.mp3?alt=media&token=57d6c9d2-37bf-4a0b-a6da-3183f8161b6c' },
  {'title': 'Fettah Can - Bırak Ağlayayım', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrzPjObqLRCicx8Cjec%2F-LrzQEFZ7pbilsRaQwwT%2Fbirakaglayayim.mp3?alt=media&token=1cc0202a-59ba-41c2-b2e0-d972a03f64f4' },
  {'title': 'Mabel Matiz - Gözlerine', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsItprVLnqLy5x9dVU7%2F-LsItsutewrF7EkyBP2d%2Fgozlerine.mp3?alt=media&token=ad5153df-c337-4477-8088-5764d0cc87dd' },
  {'title': 'Jehan Barbur - Kusura Bakmasınlar', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsIujdJHlIIyVSckGrb%2F-LsIv7waA08YN36xSgov%2Fkusurabakmasinlar.mp3?alt=media&token=dd7da2c3-f1dc-4a25-a114-aa91af9f6d5c' },
  {'title': 'Ayşe Hatun Önal - Efsane', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrePI7Rx4CN-na5E_3f%2F-LrePLSj2UlVh2LseJjd%2Fefsane.mp3?alt=media&token=b5531b1a-f587-462e-90b8-d0475fbda853' },
  {'title': 'Simge - Yalnız Başına', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrzOnzz28wGj_eIRp6X%2F-LrzP8DxvCePJA7mdPyu%2Fyalnizbasina.mp3?alt=media&token=8875b4a9-18e2-4164-bc9a-eda0fee6727c' },
  {'title': 'Tuğçe Kandemir - Yelkovan', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqzKmeYBD7-EhOhsjnD%2F-LqzLokW3DjZd_t8IWZQ%2Fyelkovan.mp3?alt=media&token=d38311f8-4fbb-42da-bd5a-cb7f177abbcf' },
  {'title': 'Mustafa Ceceli - Bedel', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LreNfb1ol7aPPTYJQBC%2F-LreOdcAOnMIWB71U9zv%2Fbedel.mp3?alt=media&token=153214cb-2416-49b8-938d-d19b219a4349' },
  {'title': 'Cem Belevi - Farkında mısın', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LreNfb1ol7aPPTYJQBC%2F-LreOGWz-lXdmR1el3ny%2Ffarkindamisin.mp3?alt=media&token=165c6249-ee36-4ef1-a94a-3b9d6cc92179' },
  {'title': 'Irmak Arıcı - Mevzum Derin', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqzKmeYBD7-EhOhsjnD%2F-LqzLClVmTE91yJVAgIb%2Fmevzumderin.mp3?alt=media&token=6f2ff932-d5dd-44b8-bf5f-86af76f3f694' },
  {'title': 'Can Bonomo - Ruhum Bela', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LsM4xpKNIGV7fViA4Cr%2F-LsM50t0cfo778YNtY4n%2Fruhumbela.mp3?alt=media&token=eba6512f-ca55-44f8-80c8-38930d9b573b' },
  {'title': 'İlyas Yalçıntaş - Farzet', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqzKmeYBD7-EhOhsjnD%2F-LqzKp75B6RZz7A8GBTV%2Ffarzet.mp3?alt=media&token=732dbe32-a214-45dc-9f09-c71cfd6515f2' },
  {'title': 'Mehmet Erdem - Sen De Vur Gülüm', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LrAt4uFPiShOFKZzKzU%2F-LrAtO4xaOox9NYMcgPi%2Fsendevurgulum.mp3?alt=media&token=5dd5f6c0-cf35-421a-8c44-9a9b30486d8d' }] });
