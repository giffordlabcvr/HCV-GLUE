package hcvGlue;

import java.util.List;

public class GenerateFindingsList {

	public static void main(String[] args) {
		List<DrugResistanceFinding> drfList = new Sarrazin2016().deriveDrugResistanceFindings();
		drfList.addAll(new Pawlotsky2016().deriveDrugResistanceFindings());
		drfList.addAll(new LontokEtAl2015().deriveDrugResistanceFindings());
		
		System.out.println("Drug\tPublication\tGene\tSubstitutions\tClade\tMinFoldChange\tMaxFoldChange");
		for(DrugResistanceFinding drf: drfList) {
			System.out.println(drf.drug+"\t"+
					drf.reference+"\t"+
					drf.gene+"\t"+
					drf.substitutions+"\t"+
					drf.clade+"\t"+
					handleNull(drf.minEcFoldChange)+"\t"+
					handleNull(drf.maxEcFoldChange));
		}

	}

	private static String handleNull(Object input) {
		if(input == null) {
			return "";
		}
		return input.toString();
	}
	
}
