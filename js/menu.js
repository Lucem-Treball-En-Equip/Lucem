addEventListener('load', function() {
    document.getElementById('play').addEventListener('click', 
    function(){
        localStorage.removeItem('isLoading');
        window.location.assign("./html/phasergame.html");
    });

    document.getElementById('saves').addEventListener('click', 
    function(){
        localStorage.setItem('isLoading', 'true');
        window.location.assign("./html/phasergame.html");
    });

    document.getElementById('exit').addEventListener('click', 
    function(){
        window.close();
    });
});