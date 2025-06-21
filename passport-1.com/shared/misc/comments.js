var Comments = {
    lang : {
        alertNeedSelect : "Выделите фрагмент цитируемого текста."
    },
    
    get_selected : function() 
    {
     var quote = '';
     if (window.getSelection) // mozilla
      quote = window.getSelection();
     else if (document.selection) // IE
      quote = document.selection.createRange().text;
     else if (document.getSelection) // others
      quote = document.getSelection();

     return quote;
    },

    ac : function (id){
        try{	
	    var t = document.getElementById('to' + id);
	    if (t.innerText) {
		    to = t.innerText;
	    } else if (t.innerHTML) {
		    to = t.innerHTML;
	    }

	    to = to.replace(/<[^>]+>/g, "");

	    text = document.commentform.text.value;

	    if (text.indexOf(to) == -1)
	    {
		    if (text.length > 0)
			    text += "\n\n";
		    text += to + "\n\n";

		    document.commentform.text.value = text;
	    }
	    document.commentform.text.focus();
        }catch(e){}
    },

    qc : function (id){
        try{

	        var d = document.getElementById('quote' + id);
	        if (!d) return;

	        var quote = new String(this.get_selected());

	        if (quote=='') 
	        {
		        alert(this.lang.alertNeedSelect);
	        } 
	        else 
	        {

		        quote = quote.replace(/\r\n/g, "\n");
		        quote = quote.replace(/\r/g, "\n");
		        quote = quote.replace(/\n/g, "\n> ");

		        if (quote.length>1000) 
		         quote = quote.substring(0, 1000) + "...";

		        if (quote.match(/^\s*[^>]/)) quote = quote.replace(/^\s*/,'> ');
		        quote = quote.replace(/\s*$/, '');

		        var t = document.getElementById('to' + id);
		        if (t.innerText) {
			        to = t.innerText;
		        } else if (t.innerHTML) {
			        to = t.innerHTML;
		        }
		        to = to.replace(/<[^>]+>/g, "");

		        text = document.commentform.text.value;
		
		        if (text.indexOf(to) == -1)
		        {
			        if (text.length > 0)
				        text += "\n\n";
			        text += to;
		        }
		        text += "\n\n" + quote + "\n\n";

		        document.commentform.text.value = text;
		        document.commentform.text.focus();
	        }
        }catch(e){}
    }
};
