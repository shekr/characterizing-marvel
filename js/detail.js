function populateDetailCard(fChar) {
	
	//TODO: update this with actual call when API integrated
	var details = characterDetailData;
	$('#vis-detail #detail-title').text(fChar.name);
	$('#vis-detail #title-box h4').remove();
	if (details.aliases != null && details.aliases != "" && details.aliases.length > 0)
		$('#vis-detail #title-box').append('<h4>'+details.aliases.join(", ")+'</h4>');		
	$('#vis-detail #bio').text(function() {
		if (fChar.bio_desc.length > 497) {
			return fChar.bio_desc.substring(0, 500) + "...";
		}
		else
			return fChar.bio_desc;
	});
	$('#vis-detail #detail-image').attr('src', function() {
		return generateImageLink(fChar.image, "portrait_medium")
	});
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

function populateRelationshipCard(data1, data2, rInfo) {
	console.log(data1);
	console.log(data2);
	$('#vis-detail #comic-head').text(data1.name + ' & ' + data2.name)
	$('#vis-detail #comic-image').attr('src', 'img/' + rInfo.image);
	$('#vis-detail #comic-link').attr("href", rInfo.link);
	$('#vis-detail #comic-title').text(rInfo.title);
	$('#vis-detail #comic-author').text(rInfo.author);
	$('#vis-detail #comics-more').attr("href", 'comics/id1='+ data1.cid +'&id2='+ data2.cid +'&set=all')
	
}
