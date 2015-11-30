function populateDetailCard(fChar) {
	
	//TODO: update this with actual call when API integrated
	var details = characterDetailData;
	$('#vis-detail #detail-title').text(fChar.name);
	$('#vis-detail #detail-alias span').text(details.aliases.join(", "));
	$('#vis-detail #detail-image').attr('src', 'img/' + fChar.image);
	$('#vis-detail #detail-affil').text(details.affiliation.join(", "));
	$('#vis-detail #detail-appear').text(fChar.appearances)
	$('#vis-detail #detail-consomm').text(details.consommation);
	$('#vis-detail #detail-gender').text(fChar.gender)
	$('#vis-detail #detail-nat').text(fChar.nationality)
	$('#vis-detail #detail-power').text(details.power.join(", "))
	$('#vis-detail #detail-year').text(fChar.intro_year)
	var totalC = $('.chord-'+ fChar.cid).size();
	var coreC = $('.chord-'+fChar.cid+'.core').size();
	$('#vis-detail #detail-connections td').html(totalC+' total<br />'+coreC+' core');
}
