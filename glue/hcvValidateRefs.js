var refObjs = glue.tableToObjects(glue.command(["list", "reference"]));

_.each(refObjs, function(refObj) {
	glue.inMode("reference/"+refObj.name, function() {
		try {
			glue.command(["validate"]);
		} catch(e) {
			glue.log("SEVERE", e.message);
		}
	});
});