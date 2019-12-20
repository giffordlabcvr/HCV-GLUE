

var cladeStructureObj = {};

cladeStructureObj.referenceSourceName = "ncbi-refseqs";
cladeStructureObj.alignmentName = "AL_MASTER";
cladeStructureObj.almtDisplayName = "Hepatitis C Virus (HCV)";
cladeStructureObj.cladeCategory = "species";
cladeStructureObj.childAlignments = [];

var ictvAlmtFastaIDs;

// use FASTA IDs from the ICTV alignment to name genotypes and subtypes, choose reference sequences,
// and identify unassigned subtypes
glue.inMode("module/hcvFastaUtility", function() {
	var fastaDoc = glue.command(["load-nucleotide-fasta", "alignments/ICTV_HCV_Alignment_8th_May_2019.fasta"]);
	ictvAlmtFastaIDs = _.map(fastaDoc.nucleotideFasta.sequences, function(seqObj) {return seqObj.id.replace("?", "")});
}); 


var refObjs = _.map(ictvAlmtFastaIDs, function(ictvAlmtFastaID) {
	var refObj = {};
	var bits = ictvAlmtFastaID.split("_");
	refObj.sequenceID = bits[1];
	
	// replace GenBank IDs with their RefSeq equivalents where appropriate, 
	// and mark out genotype / master constraining refs.

	// Genotype 1 / master ref
	if(refObj.sequenceID == "AF009606") {
		refObj.sequenceID = "NC_004102";
		// master ref
		cladeStructureObj.constrainingRef = { "sequenceID": refObj.sequenceID };
		refObj.gtRef = true;
	}

	// Genotype 2
	if(refObj.sequenceID == "D00944") {
		refObj.gtRef = true;
	}
	
	// Genotype 3
	if(refObj.sequenceID == "D17763") {
		refObj.sequenceID = "NC_009824";
		refObj.gtRef = true;
	}
	refObj.sequenceID = refObj.sequenceID.replace("D17763", "NC_009824");

	// Genotype 4
	if(refObj.sequenceID == "Y11604") {
		refObj.sequenceID = "NC_009825";
		refObj.gtRef = true;
	}
	refObj.sequenceID = refObj.sequenceID.replace("Y11604", "NC_009825");

	// Genotype 5
	if(refObj.sequenceID == "Y13184") {
		refObj.sequenceID = "NC_009826";
		refObj.gtRef = true;
	}
	refObj.sequenceID = refObj.sequenceID.replace("Y13184", "NC_009826");

	// Genotype 6
	if(refObj.sequenceID == "D84262") {
		refObj.sequenceID = "NC_009827";
		refObj.gtRef = true;
	}
	refObj.sequenceID = refObj.sequenceID.replace("D84262", "NC_009827");

	// Genotype 7
	if(refObj.sequenceID == "EF108306") {
		refObj.sequenceID = "NC_030791";
		refObj.gtRef = true;
	}
	refObj.sequenceID = refObj.sequenceID.replace("EF108306", "NC_030791");

	// Genotype 8
	if(refObj.sequenceID == "MH590698") {
		refObj.gtRef = true;
	}
	
	var subtypeStartIdx = 0;
	var gtPrefix = bits[0];
	for(var i = 0; i < gtPrefix.length; i++) {
		var c = gtPrefix[i];
		if(!(c >= '0' && c <= '9')) {
			subtypeStartIdx = i;
			break;
		}
	}
	if(subtypeStartIdx > 0) {
		refObj.genotype = gtPrefix.substring(0, subtypeStartIdx);
		refObj.subtype = gtPrefix.substring(subtypeStartIdx);
		refObj.subtypeFull = gtPrefix;
		refObj.status = "confirmed";
	} else {
		refObj.genotype = gtPrefix;
		refObj.status = "unassigned";
	}
	
	return refObj;
});

var genotypeToRefObjs = _.groupBy(refObjs, function(refObj) {return refObj.genotype;} );

_.each(_.pairs(genotypeToRefObjs), function(pair) {
	var gtName = pair[0];
	var gtRefObjs = pair[1];
	var gtObj = {};

	var gtConstrainingRef;
	_.each(gtRefObjs, function(gtRefObj) {
		if(gtRefObj.gtRef) {
			if(gtConstrainingRef == null) {
				gtConstrainingRef = gtRefObj.sequenceID;
			} else {
				throw new Error("Multiple constraining refs defined for gentoype "+gtName);
			}
		}
	});
	if(gtConstrainingRef == null) {
		throw new Error("No constraining refs defined for gentoype "+gtName);
	}
	gtObj.constrainingRef = {sequenceID: gtConstrainingRef};
	gtObj.alignmentName = "AL_"+gtName;
	gtObj.almtDisplayName = "HCV Genotype "+gtName;
	gtObj.cladeCategory = "genotype"; 

	var gtRefObjsConfirmed = _.filter(gtRefObjs, function(gtro) { return gtro.status == 'confirmed'; });
	
	// group the reference sequences with confirmed subtypes within this genotype into subtypes
	var stNameToRefObjs = _.groupBy(gtRefObjsConfirmed, function(gtro) { return gtro.subtypeFull; });
	gtObj.childAlignments = []; 
	
	_.each(_.pairs(stNameToRefObjs), function(pair2) {
		var stFullName = pair2[0];
		var stRefObjs = pair2[1];

		var stObj = {};
		stObj.alignmentName = "AL_"+stFullName;
		stObj.almtDisplayName = "HCV Subtype "+stFullName;
		stObj.cladeCategory = "subtype";
		stObj.status = "confirmed";

		var firstSequenceID;
		var stConstrainingRef;
		_.each(stRefObjs, function(stRefObj) {
			var sequenceID = stRefObj.sequenceID;
			if(firstSequenceID == null) {
				firstSequenceID = sequenceID;
			}
			if(stRefObj.gtRef) { // use gt ref as subtype constraining ref if possible
				stConstrainingRef = sequenceID;
			}
		});
		if(stConstrainingRef == null) {
			stConstrainingRef = firstSequenceID;
		}
		stObj.constrainingRef = {sequenceID: stConstrainingRef};

		
		stObj.referenceSequences = _.map(stRefObjs, function(stro) {
			return { "sequenceID": stro.sequenceID };
		});
		
		gtObj.childAlignments.push(stObj);
	});

	var gtRefObjsUnassigned = _.filter(gtRefObjs, function(gtro) { return gtro.status == 'unassigned'; });
	_.each(gtRefObjsUnassigned, function(gtUnassignedRefObj) {
		var stObj = {};
		stObj.alignmentName = "AL_"+gtUnassignedRefObj.genotype+"_unassigned_"+gtUnassignedRefObj.sequenceID;
		stObj.almtDisplayName = "HCV Subtype "+gtUnassignedRefObj.genotype+"_"+gtUnassignedRefObj.sequenceID+" (unassigned)";
		stObj.cladeCategory = "subtype"
		stObj.status = "unassigned";
		stObj.constrainingRef = {sequenceID: gtUnassignedRefObj.sequenceID};
		stObj.referenceSequences = [ { "sequenceID": gtUnassignedRefObj.sequenceID } ];

		gtObj.childAlignments.push(stObj);
});
	
	cladeStructureObj.childAlignments.push(gtObj);
	
});

glue.command(["file-util", "save-string", JSON.stringify(cladeStructureObj, null, 2), "json/hcv_clade_structure_and_refs.json"]);

