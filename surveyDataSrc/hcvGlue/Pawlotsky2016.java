package hcvGlue;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Pawlotsky2016 {

	String[] clades = {"1a", "1b", "2", "3", "4", "5", "6"};
	
	Map<String, Section> headingToSection = new LinkedHashMap<String, Section>();
	private Section currentSection;
	
	public Pawlotsky2016() {
		headingToSection.put("Nucleotide analogues (sofosbuvir)", 
				new Section("NS5B", new String[]{"sofosbuvir"}));
		headingToSection.put("NS5A inhibitors (first-generation drugs<comma> including first wave and second wave)", 
				new Section("NS5A", new String[]{"daclatasvir", "elbasvir", "ledipasvir", "ombitasvir", "velpatasvir"}));
		headingToSection.put("NS3-4A protease inhibitors (first-generation drugs<comma> including first wave and second wave)", 
				new Section("NS3", new String[]{"asunaprevir", "paritaprevir", "simeprevir"}));
		headingToSection.put("Nonnucleoside RdRp palm-1 inhibitors (dasabuvir)", 
				new Section("NS5B", new String[]{"dasabuvir"}));
	}
	
	private class Section {
		String gene;
		String[] drugs;
		public Section(String gene, String[] drugs) {
			super();
			this.gene = gene;
			this.drugs = drugs;
		}
	}

	Set<RAS> deriveRasSet() {
		this.currentSection = null;
		TreeSet<RAS> rasSet = new TreeSet<RAS>();
		InputStream is = getClass().getResourceAsStream("/hcvGlue/pawlotsky_2016_drug_resistance_findings.csv");
		try(BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			br.lines().forEach(line -> {
				String[] cells = line.split(",");
				if(cells.length > 0) {
					Section newSection = headingToSection.get(cells[0]);
					if(newSection != null) {
						this.currentSection = newSection;
					}
					if(this.currentSection != null && cells.length > 1) {
						for(int i = 1; i < cells.length; i++) {
							String cellText = cells[i].trim();
							if(cellText.length() > 0) {
								cellText = cellText.replaceAll("\\(.*\\)", "");
								String[] cellBits = cellText.split(" ");
								for(String cellBit: cellBits) {
									rasSet.addAll(cellBitToRasSet(cellBit));
								}
							}
						}
					}

				}
			});
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return rasSet;
	}

	List<DrugResistanceFinding> deriveDrugResistanceFindings() {
		this.currentSection = null;
		List<DrugResistanceFinding> drfList = new ArrayList<DrugResistanceFinding>();
		InputStream is = getClass().getResourceAsStream("/hcvGlue/pawlotsky_2016_drug_resistance_findings.csv");
		try(BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			br.lines().forEach(line -> {
				String[] cells = line.split(",");
				if(cells.length > 0) {
					Section newSection = headingToSection.get(cells[0]);
					if(newSection != null) {
						this.currentSection = newSection;
					}
					if(this.currentSection != null && cells.length > 1) {
						for(int i = 1; i < cells.length; i++) {
							String cellText = cells[i].trim();
							if(cellText.length() > 0) {
								if(i <= clades.length) {
									String clade = clades[i-1];
									TreeSet<RAS> rasSet = cellBitToRasSet(cellText);
									for(RAS ras: rasSet) {
										for(String drug: this.currentSection.drugs) {
											drfList.add(
													new DrugResistanceFinding(drug,
															ras.gene, ras.codon, ras.substitutions, clade, 
															2.0, 100.0, "Pawlotsky_2016"));
										}
									}
								}
								if(i == clades.length+1) {
									String[] cellBits = cellText.split("\\)");
									for(String cellBit: cellBits) {
										if(currentSection.gene.equals("NS3")) {
											if(cellBit.equals("A156T/V")) {
												cellBit = "A156T/V (1";
											}
											if(cellBit.equals("D168H/T/K/V/Y")) {
												cellBit = "D168H/T/K/V/Y (1";
											}
										}
										if(currentSection.gene.equals("NS5B")) {
											if(cellBit.equals("L314H")) {
												cellBit = "L314H (1a";
											}
										}
										String[] rasPlusClade = cellBit.split(" \\(");
										String rasString = rasPlusClade[0];
										String cladeString = rasPlusClade[1];
										String[] highResistanceClades;
										if(cladeString.equals("all")) {
											highResistanceClades = this.clades;
										} else {
											highResistanceClades = new String[]{cladeString};
										}
										TreeSet<RAS> rasSet = cellBitToRasSet(rasString);
										for(RAS ras: rasSet) {
											List<String> drugs = new ArrayList<String>(Arrays.asList(this.currentSection.drugs));
											// "Substitutions at positions 156 and 168 also confer resistance to the 
											//  second-generation NS3-4A protease inhibitor grazoprevir."
											if(ras.gene.equals("NS3") && (ras.codon.equals(156) || ras.codon.equals(168))) {
												drugs.add("grazoprevir");
											}
											for(String highResistanceClade: highResistanceClades) {
												for(String drug: drugs) {
													drfList.add(
														new DrugResistanceFinding(drug,
																ras.gene, ras.codon, ras.substitutions, highResistanceClade, 
																100.0, null, "Pawlotsky_2016"));
													drfList.remove(
															new DrugResistanceFinding(drug,
																	ras.gene, ras.codon, ras.substitutions, highResistanceClade, 
																	2.0, 100.0, "Pawlotsky_2016"));
												}
											}
										}
									}
								}
							}
						}
					}

				}
			});
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return drfList;
	}

	
	
	
	private TreeSet<RAS> cellBitToRasSet(String cellBit) {
		Pattern p = Pattern.compile("^([A-Z](?:/[A-Z])*)(\\d+)([A-Z](?:/[A-Z])*)$");
		Matcher matcher = p.matcher(cellBit);
		boolean findResult = matcher.find();
		if(!findResult) {
			throw new RuntimeException("cellBit '"+cellBit+"' did not match expected regex");
		}
		int codon = Integer.parseInt(matcher.group(2));
		String[] substitutions = matcher.group(3).split("/");
		TreeSet<RAS> localRasSet = new TreeSet<RAS>();
		for(String substitution: substitutions) {
			localRasSet.add(new RAS(currentSection.gene, codon, codon+substitution));
		}
		return localRasSet;
	}

	public static void main(String[] args) {
		Pawlotsky2016 pawlotsky2016 = new Pawlotsky2016();
		Set<RAS> rasSet = pawlotsky2016.deriveRasSet();
		for(RAS ras: rasSet) {
			System.out.println(ras.gene+"\t"+ras.substitutions);
		}
		List<DrugResistanceFinding> drfList = pawlotsky2016.deriveDrugResistanceFindings();
		for(DrugResistanceFinding drf: drfList) {
			System.out.println(drf.drug+"\t"+
					drf.reference+"\t"+
					drf.gene+"\t"+
					drf.substitutions+"\t"+
					drf.clade+"\t"+
					drf.minEcFoldChange+"\t"+
					drf.maxEcFoldChange);
		}
	}
	
}
