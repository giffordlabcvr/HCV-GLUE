package hcvGlue;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;


public class LontokEtAl2015 {

	private List<String> drugs = Arrays.asList("asunaprevir", "simeprevir","paritaprevir","daclatasvir","ombitasvir","ledipasvir","dasabuvir","sofosbuvir");
	
	public LontokEtAl2015() {
	}
	
	Set<RAS> deriveRasSet() {
		TreeSet<RAS> rasSet = new TreeSet<RAS>();
		InputStream is = getClass().getResourceAsStream("/hcvGlue/lontok_et_al_drug_resistance_findings.txt");
		try(BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			br.lines().forEach(line -> {
				String[] cells = line.split("\t");
				if(cells.length > 0) {
					String drugCell = cells[0];
					if(drugs.contains(drugCell)) {
						String gene = cells[1];
						String substitutionsCell = cells[2];
						if(!substitutionsCell.equals("none")) {
							List<String> subBits = Arrays.asList(substitutionsCell.split("\\+"));
							int firstCodon = Integer.parseInt(subBits.get(0).replaceAll("[A-Z]+", ""));
							subBits = subBits.stream().map(s -> s.substring(1)).collect(Collectors.toList());
							String substitutions = String.join("+", subBits.toArray(new String[]{}));
							rasSet.add(new RAS(gene, firstCodon, substitutions));
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
		List<DrugResistanceFinding> drfList = new ArrayList<DrugResistanceFinding>();
		InputStream is = getClass().getResourceAsStream("/hcvGlue/lontok_et_al_drug_resistance_findings.txt");
		try(BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
			br.lines().forEach(line -> {
				String[] cells = line.split("\t");
				if(cells.length > 0) {
					String drugCell = cells[0];
					if(drugs.contains(drugCell)) {
						String gene = cells[1];
						String substitutionsCell = cells[2];
						String cladeCell = cells[3];
						if(!substitutionsCell.equals("none")) {
							Double minEc50fc = null;
							Double maxEc50fc = null;
							String ec50String = cells[4].replaceAll(",", "");
							if(ec50String.startsWith(">")) {
								minEc50fc = Double.parseDouble(ec50String.substring(1));
							} else {
								minEc50fc = Double.parseDouble(ec50String);
								maxEc50fc = minEc50fc;
							}
							List<String> subBits = Arrays.asList(substitutionsCell.split("\\+"));
							int firstCodon = Integer.parseInt(subBits.get(0).replaceAll("[A-Z]+", ""));
							subBits = subBits.stream().map(s -> s.substring(1)).collect(Collectors.toList());
							String substitutions = String.join("+", subBits.toArray(new String[]{}));
							drfList.add(
									new DrugResistanceFinding(drugCell,
											gene, firstCodon, substitutions, cladeCell, 
											minEc50fc, maxEc50fc, "Lontok_et_al_2015"));
							}
					}
				}
			});
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return drfList;
	}
	

	public static void main(String[] args) {
		LontokEtAl2015 lontokEtAl2015 = new LontokEtAl2015();
		Set<RAS> rasSet = lontokEtAl2015.deriveRasSet();
		for(RAS ras: rasSet) {
			System.out.println(ras.gene+"\t"+ras.substitutions);
		}
		List<DrugResistanceFinding> drfList = lontokEtAl2015.deriveDrugResistanceFindings();
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
