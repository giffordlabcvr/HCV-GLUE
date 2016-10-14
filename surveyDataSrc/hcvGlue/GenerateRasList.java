package hcvGlue;

import java.util.Set;

public class GenerateRasList {

	public static void main(String[] args) {
		Set<RAS> rasSet = new Sarrazin2016().deriveRasSet();
		rasSet.addAll(new Pawlotsky2016().deriveRasSet());
		rasSet.addAll(new LontokEtAl2015().deriveRasSet());
		
		System.out.println("Gene\tSubstitutions");
		for(RAS ras: rasSet) {
			System.out.println(ras.gene+"\t"+ras.substitutions);
		}

	}
	
}
