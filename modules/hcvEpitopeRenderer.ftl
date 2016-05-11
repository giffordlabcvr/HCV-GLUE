<#-- null handling GLUE result element macro -->
<#macro elem tag expr>
<#if (expr?eval) ??>
<${tag}>${expr?eval}</${tag}>
<#else>
<${tag} glueType="Null"/>
</#if>
</#macro>

<epitope>
	<name>${name}</name>
	<referenceSequence>${featureLoc.referenceSequence.name}</referenceSequence>
	<feature>${featureLoc.feature.name}</feature>
	<pattern>${regex}</pattern>
    <@elem tag="hla" expr="epitope_full_hla"/>
    <@elem tag="iedb_id" expr="epitope_iedb_id"/>
    <@elem tag="pubmed_id" expr="pubmed_id"/>
    <@elem tag="stage" expr="epitope_stage"/>
    <@elem tag="measurement" expr="epitope_measurement"/>
    <@elem tag="effector_tissue_type" expr="epitope_effector_tissue_type"/>
    <@elem tag="effector_cell_type" expr="epitope_effector_cell_type"/>
    <@elem tag="effector_cell_culture_condition" expr="epitope_effector_cell_culture_condition"/>
</epitope>