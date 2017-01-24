package uk.ac.gla.cvr;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class GlueScriptGenerator {

	
	public static void main(String[] args) {
		
		for(String cladeLevel: new String[]{"genotype", "subtype"}) {
			boolean[] trueFalse = {true, false};
			String baseCondition = "source.name = 'ncbi-curated' and gb_recombinant = 'false' and gb_lab_construct = 'false'";
			
			for(boolean gbDefined: trueFalse) {
				for(boolean epaDefined: trueFalse) {
					for(boolean viprDefined: trueFalse) {
						String nullComment = nullComment(cladeLevel, gbDefined, epaDefined, viprDefined);
						List<String> nullTests = nullTests(cladeLevel, gbDefined, epaDefined, viprDefined);
						List<String> equalityTests = genotypeEqualityTests(cladeLevel, gbDefined, epaDefined, viprDefined);
						System.out.println("# Section: "+nullComment);
						List<String> equalityComments = genotypeEqualityComments(cladeLevel, gbDefined, epaDefined, viprDefined);
						for(int i = 0; i < equalityTests.size(); i++) {
							System.out.println("# Result: "+equalityComments.get(i));
							System.out.print("count sequence -w \""+baseCondition);
							for(String nullTest: nullTests) {
								System.out.println(" and \\");
								System.out.print("    "+nullTest);
							}
							System.out.println(" and \\");
							System.out.print("    "+equalityTests.get(i));
							System.out.println("\"");
						}
						System.out.println("# Result: Total");
						System.out.print("count sequence -w \""+baseCondition);
						for(String nullTest: nullTests) {
							System.out.println(" and \\");
							System.out.print("    "+nullTest);
						}
						System.out.println("\"");
						System.out.println("# Section end\n");
					}
				}
			}
		}
		
		
	}
	
	
	private static String nullComment(String cladeLevel, boolean gbDefined, boolean epaDefined, boolean viprDefined) {
		if( gbDefined &&  epaDefined &&  viprDefined) {
			return "Metadata, EPA and ViPR "+cladeLevel+"s assigned";
		}
		if( gbDefined &&  epaDefined && !viprDefined) {
			return "Only metadata and EPA "+cladeLevel+"s assigned";
		}
		if( gbDefined && !epaDefined &&  viprDefined) {
			return "Only metadata and ViPR "+cladeLevel+"s assigned";
		}
		if( gbDefined && !epaDefined && !viprDefined) {
			return "Only metadata "+cladeLevel+" assigned";
		}
		if(!gbDefined &&  epaDefined &&  viprDefined) {
			return "Only EPA and ViPR "+cladeLevel+"s assigned";
		}
		if(!gbDefined &&  epaDefined && !viprDefined) {
			return "Only EPA "+cladeLevel+" assigned";
		}
		if(!gbDefined && !epaDefined &&  viprDefined) {
			return "Only ViPR "+cladeLevel+" assigned";
		}
		if(!gbDefined && !epaDefined && !viprDefined) {
			return "Neither metadata, EPA nor ViPR define "+cladeLevel;
		}
		throw new RuntimeException("Unexpected combo");
	}


	private static List<String> nullTests(String cladeLevel, boolean gbDefined, boolean epaDefined, boolean viprDefined) {
		List<String> nullTests = new ArrayList<String>();
		if(cladeLevel.equals("genotype")) {
			if(gbDefined) {
				nullTests.add("gb_genotype != null");
			} else {
				nullTests.add("gb_genotype == null");
			}
			if(epaDefined) {
				nullTests.add("epa_genotype != null");
			} else {
				nullTests.add("epa_genotype == null");
			}
			if(viprDefined) {
				nullTests.add("vipr_genotype != null");
			} else {
				nullTests.add("vipr_genotype == null");
			}
			return nullTests;
		}

		if(cladeLevel.equals("subtype")) {
			if(gbDefined) {
				nullTests.add("gb_genotype != null and gb_subtype != null");
			} else {
				nullTests.add("(gb_genotype == null or gb_subtype == null)");
			}
			if(epaDefined) {
				nullTests.add("epa_genotype != null and epa_subtype != null");
			} else {
				nullTests.add("(epa_genotype == null or epa_subtype == null)");
			}
			if(viprDefined) {
				nullTests.add("vipr_genotype != null and vipr_subtype != null");
			} else {
				nullTests.add("(vipr_genotype == null or vipr_subtype == null)");
			}
			return nullTests;
		}
		
		throw new RuntimeException("unexpected cladeLevel");
}


	private static List<String> genotypeEqualityTests(String cladeLevel, boolean gbDefined,
			boolean epaDefined, 
			boolean viprDefined) {
		List<String[]> assignedPairs = new LinkedList<String[]>();
		int numDefinedPairs = 0;
		if(gbDefined && epaDefined) {
			assignedPairs.add(new String[]{"gb", "epa"});
			numDefinedPairs++;
		}
		if(epaDefined && viprDefined) {
			assignedPairs.add(new String[]{"epa", "vipr"});
			numDefinedPairs++;
		}
		if(viprDefined && gbDefined) {
			assignedPairs.add(new String[]{"vipr", "gb"});
			numDefinedPairs++;
		}
		ArrayList<String> equalityTests = new ArrayList<String>();
		if(assignedPairs.isEmpty()) {
			return equalityTests;
		}
		if(numDefinedPairs == 3) {
			String[] pair1 = assignedPairs.get(0);
			String[] pair2 = assignedPairs.get(1);
			String[] pair3 = assignedPairs.get(2);
			equalityTests.add(   equality(cladeLevel, pair1)+" and "+   equality(cladeLevel, pair2)+" and "+   equality(cladeLevel, pair3));
			equalityTests.add(   equality(cladeLevel, pair1)+" and "+disequality(cladeLevel, pair2)+" and "+disequality(cladeLevel, pair3));
			equalityTests.add(disequality(cladeLevel, pair1)+" and "+   equality(cladeLevel, pair2)+" and "+disequality(cladeLevel, pair3));
			equalityTests.add(disequality(cladeLevel, pair1)+" and "+disequality(cladeLevel, pair2)+" and "+   equality(cladeLevel, pair3));
			equalityTests.add(disequality(cladeLevel, pair1)+" and "+disequality(cladeLevel, pair2)+" and "+disequality(cladeLevel, pair3));
			return equalityTests;
		}
		if(numDefinedPairs == 1) {
			String[] pair1 = assignedPairs.get(0);
			equalityTests.add(equality(cladeLevel, pair1));
			equalityTests.add(disequality(cladeLevel, pair1));
			return equalityTests;
		}
		throw new RuntimeException("Unexpected numDefinedPairs");
	}

	
	private static List<String> genotypeEqualityComments(String cladeLevel, boolean gbDefined,
			boolean epaDefined, 
			boolean viprDefined) {
		List<String[]> assignedPairs = new LinkedList<String[]>();
		int numDefinedPairs = 0;
		if(gbDefined && epaDefined) {
			assignedPairs.add(new String[]{"Metadata", "EPA"});
			numDefinedPairs++;
		}
		if(epaDefined && viprDefined) {
			assignedPairs.add(new String[]{"EPA", "ViPR"});
			numDefinedPairs++;
		}
		if(viprDefined && gbDefined) {
			assignedPairs.add(new String[]{"ViPR", "metadata"});
			numDefinedPairs++;
		}
		ArrayList<String> equalityComments = new ArrayList<String>();
		if(assignedPairs.isEmpty()) {
			return equalityComments;
		}
		if(numDefinedPairs == 3) {
			equalityComments.add("Metadata, EPA and ViPR all agree on "+cladeLevel);
			equalityComments.add("Metadata and EPA agree on "+cladeLevel+" but disagree with ViPR");
			equalityComments.add("EPA and ViPR agree on "+cladeLevel+" but disagree with Metadata");
			equalityComments.add("ViPR and Metadata agree on "+cladeLevel+" but disagree with EPA");
			equalityComments.add("Metadata, EPA and ViPR all disagree on "+cladeLevel);
			return equalityComments;
		}
		if(numDefinedPairs == 1) {
			String[] pair1 = assignedPairs.get(0);
			equalityComments.add(pair1[0]+" and "+pair1[1]+" agree on "+cladeLevel);
			equalityComments.add(pair1[0]+" and "+pair1[1]+" disagree on "+cladeLevel);
			return equalityComments;
		}
		throw new RuntimeException("Unexpected numDefinedPairs");
	}

	
	
	private static String equality(String cladeLevel, String[] assignedPair) {
		if(cladeLevel.equals("genotype")) {
			return assignedPair[0]+"_genotype" + " = " + assignedPair[1] + "_genotype";
		}
		if(cladeLevel.equals("subtype")) {
			return assignedPair[0]+"_genotype" + " = " + assignedPair[1] + "_genotype" + " and " +
					   assignedPair[0]+"_subtype" + " = " +  assignedPair[1] + "_subtype";
		}
		throw new RuntimeException("unexpected cladeLevel");

	}

	private static String disequality(String cladeLevel, String[] assignedPair) {
		if(cladeLevel.equals("genotype")) {
			return assignedPair[0]+"_genotype" + " != " + assignedPair[1] + "_genotype";
		}		
		if(cladeLevel.equals("subtype")) {
			return "(" +assignedPair[0]+"_genotype" + " != " + assignedPair[1] + "_genotype" + " or " +
					    assignedPair[0]+"_subtype" + " != " +  assignedPair[1] + "_subtype" + ")";
		}
		throw new RuntimeException("unexpected cladeLevel");

	}


	
}
