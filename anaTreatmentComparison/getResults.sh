gluetools.sh -p cmd-result-format:csv -E -i project HCV list sequence -w "source.name = 'treatmentComparison'" sequenceID GENOTYPE SUBTYPE RESPONDED POST_TREATMENT > /tmp/sequences.txt

gluetools.sh -p cmd-result-format:csv -E -i project HCV module mutationFrequencies alignment scan variation-category AL_MASTER -r -w "sequence.source.name = 'treatmentComparison'" H77_AF009606 NS3 resistance_associated > /tmp/NS3_RAVs.txt

gluetools.sh -p cmd-result-format:csv -E -i project HCV module mutationFrequencies alignment scan variation-category AL_MASTER -r -w "sequence.source.name = 'treatmentComparison'" H77_AF009606 NS5A resistance_associated > /tmp/NS5A_RAVs.txt

gluetools.sh -p cmd-result-format:csv -E -i project HCV module mutationFrequencies alignment scan variation-category AL_MASTER -r -w "sequence.source.name = 'treatmentComparison'" H77_AF009606 NS5B resistance_associated > /tmp/NS5B_RAVs.txt
