package hcvGlue;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Sarrazin2016 {

	String[] clades = {"1a", "1b", "2", "3a", "4a", "5a", "6a"};
	
	Map<String, String> drugAbbrToDrug = new LinkedHashMap<String, String>();
	
	public Sarrazin2016() {
		drugAbbrToDrug.put("ASV", "asunaprevir");
		drugAbbrToDrug.put("GZR", "grazoprevir");
		drugAbbrToDrug.put("PTV", "paritaprevir");
		drugAbbrToDrug.put("SMV", "simeprevir");
		drugAbbrToDrug.put("DCV", "daclatasvir");
		drugAbbrToDrug.put("LDV", "ledipasvir");
		drugAbbrToDrug.put("OMV", "ombitasvir");
		drugAbbrToDrug.put("DSV", "dasabuvir");
		drugAbbrToDrug.put("SOF", "sofosbuvir");
	}
	
	Set<RAS> deriveRasSet() {
		TreeSet<RAS> rasSet = new TreeSet<RAS>();
		InputStream is = getClass().getResourceAsStream("/hcvGlue/sarrazin_2016_drug_resistance_findings.txt");
		try(BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			br.lines().forEach(line -> {
				String[] cells = line.split(" ");
				if(cells.length > 0) {
					String firstCell = cells[0];
					firstCell = firstCell.replaceAll("[\\+\\*#]", "");
					Pattern p = Pattern.compile("^([A-Z](?:/[A-Z])*)(\\d+)([A-Z](?:/[A-Z])*)$");
					if(!p.matcher(firstCell).find()) {
						throw new RuntimeException("First cell value "+firstCell+" did not match regex");
					}
					String gene = cells[1];
					rasSet.addAll(cellBitToRasSet(gene, firstCell));
				}
			});
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return rasSet;
	}
	List<DrugResistanceFinding> deriveDrugResistanceFindings() {
		List<DrugResistanceFinding> drfList = new ArrayList<DrugResistanceFinding>();
		InputStream is = getClass().getResourceAsStream("/hcvGlue/sarrazin_2016_drug_resistance_findings.txt");
		try(BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			br.lines().forEach(line -> {
				String[] cells = line.split(" ");
				if(cells.length > 0) {
					String firstCell = cells[0];
					firstCell = firstCell.replaceAll("[\\+\\*#]", "");
					String gene = cells[1];
					String drugsCell = cells[2];
					String[] drugBits = drugsCell.split("/");
					List<String> drugs = new ArrayList<String>();
					for(String drugAbbr: drugBits) {
						if(drugAbbrToDrug.containsKey(drugAbbr)) {
							drugs.add(drugAbbrToDrug.get(drugAbbr));
						}
					}
					TreeSet<RAS> rasSet = cellBitToRasSet(gene, firstCell);
					for(int i = 0; i < clades.length; i++) {
						String cellText = cells[i+3].trim();
						if(cellText.equals("n.d.") || cellText.equals("n.a.") || cellText.equals("n.r.")) {
							continue;
						}
						cellText = cellText.replace("->", "-");
						cellText = cellText.replaceAll("[\\+\\*#]", "");
						Double minEc50 = null;
						Double maxEc50 = null;
						if(cellText.equals(">100")) {
							minEc50 = 100.0;
						} else if(cellText.equals("2-20")) {
							minEc50 = 2.0;
							maxEc50 = 20.0;
						} else if(cellText.equals("20-100")) {
							minEc50 = 20.0;
							maxEc50 = 100.0;
						} else if(cellText.equals("2-100")) {
							minEc50 = 2.0;
							maxEc50 = 100.0;
						} else if(cellText.equals("4")) {
							minEc50 = 4.0;
							maxEc50 = 4.0;
						} else {
							throw new RuntimeException("Do not understand cell text: "+cellText);
						}
						for(RAS ras: rasSet) {
							for(String drug: drugs) {
								// A156T confers only a 2–20-fold resistance towards asunaprevir in GT1b
								if(drug.equals("asunaprevir") && firstCell.equals("A156T")) {
									minEc50 = 2.0;
									maxEc50 = 20.0;
								}
								// Q30H conferred a 2–20-fold resistance towards OMV and 
								// a >100-fold resistance towards LDV and DCV
								if(drug.equals("ombitasvir") && firstCell.equals("Q30H")) {
									minEc50 = 2.0;
									maxEc50 = 20.0;
								}
								if(drug.equals("ledipasvir") && firstCell.equals("Q30H")) {
									minEc50 = 100.0;
									maxEc50 = null;
								}
								if(drug.equals("daclatasvir") && firstCell.equals("Q30H")) {
									minEc50 = 100.0;
									maxEc50 = null;
								}
								drfList.add(
										new DrugResistanceFinding(drug,
												ras.gene, ras.codon, ras.substitutions, clades[i], 
												minEc50, maxEc50, "Sarrazin_2016"));
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
	
	
	
	private TreeSet<RAS> cellBitToRasSet(String gene, String cellBit) {
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
			localRasSet.add(new RAS(gene, codon, codon+substitution));
		}
		return localRasSet;
	}

	public static void main(String[] args) {
		Sarrazin2016 sarrazin2016 = new Sarrazin2016();
		Set<RAS> rasSet = sarrazin2016.deriveRasSet();
		for(RAS ras: rasSet) {
			System.out.println(ras.gene+"\t"+ras.substitutions);
		}
		List<DrugResistanceFinding> drfList = sarrazin2016.deriveDrugResistanceFindings();
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
