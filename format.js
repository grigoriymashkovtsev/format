function onOpen( e ) {
	DocumentApp.getUi().createAddonMenu()
		.addItem('Расставить отступы', 'format')
		.addItem( 'Типографить', 'typograph' ).addToUi();
}



function format() {
	var doc = DocumentApp.getActiveDocument();
	var body = doc.getBody();
	var config = {
		indent: {
			step: 36,
			firstLine: -7,
			start: 0
		}
	};
	var paragraphstyle = {};
	paragraphstyle[ DocumentApp.Attribute.HORIZONTAL_ALIGNMENT ] = DocumentApp.HorizontalAlignment.LEFT;

	var doc = DocumentApp.getActiveDocument();
	var body = doc.getBody();
    var listItems = body.getListItems();
    
	// List format
	listItems.forEach( function( listItem ) {
		var nestingLevel = listItem.getNestingLevel();
		var indent = ( nestingLevel - 1 ) * config.indent.step;
		var firstLine = config.indent.firstLine;
        var start = config.indent.start;
        
		if ( nestingLevel > 1 ) {
			firstLine = firstLine + indent;
			start = start + indent;
        }
        
		listItem.setIndentFirstLine( firstLine );
		listItem.setIndentStart( start );
		listItem.setSpacingAfter( 10 );
        listItem.setAttributes( paragraphstyle );
        
		if ( listItem.getGlyphType() != DocumentApp.GlyphType.NUMBER ) {
			listItem.setIndentFirstLine( -20 );
			listItem.setIndentStart( 0 );
			listItem.setSpacingAfter( 10 );
			listItem.setAttributes( paragraphstyle );
        }
        
    } );
    


	var childIndex = 0;
	for ( var i = 0; i < doc.getNumChildren(); i++ ) {
		var child = doc.getChild( i );
		if ( child.getType() == DocumentApp.ElementType.PARAGRAPH ) {
			child.setIndentStart( 0 );
			child.setIndentFirstLine( 0 );
			child.setSpacingAfter( 10 );
			child.setAttributes( paragraphstyle );
		}
    }
    


    
    
}

function typograph() {

	var doc = DocumentApp.getActiveDocument();
	var body = DocumentApp.getActiveDocument().getBody();
    var childIndex = 0;
    
	for ( var i = 0; i < doc.getNumChildren(); i++ ) {
        var child = doc.getChild( i );
        
		if ( child.getType() == DocumentApp.ElementType.PARAGRAPH || child.getType() == DocumentApp.ElementType.LIST_ITEM ) {

			// Проверяем, не пустой ли параграф
			if ( child.getText().length != 0 ) {

				// Если в тексте встречается неразрывной пробел, типограф вылетает, поэтому, перед тем как отправлять запрос, меняем неразрывные пробелы на обычные
                child.replaceText( '[\u00A0]', ' ' );
                
				// Если в тексте встречается знак процента то типограф тоже вылетает, поэтому меняем знак процента на слово «знак_процента» 
                child.replaceText( '%', 'знак_процента' );
                
				// Типограф спотыкается если увидит в тексте знак номер, меняем знак номер на слово «знак_номера»
				child.replaceText( '№', 'знак_номера' );
                var childtext = child.getText();
                
				// Отправляем запрос к апи типографа
				var response = UrlFetchApp.fetch( 'http://mdash.ru/api.v1.php?text=' + childtext + '&Text.paragraphs=off&Etc.unicode_convert=on&OptAlign.oa_oquote=off&OptAlign.oa_obracket_coma=off' );
				var json = response.getContentText();
				var data = JSON.parse( json );
                child.setText( data.result );
                
				// Когда получили отформатированный текст, меняем слово «знак_процента» обратно на знак процента
                child.replaceText( 'знак_процента', '%' );
                
				//Когда получили текст меняем обратно
				child.replaceText( 'знак_номера', '№' );
			}
		}
	}
}