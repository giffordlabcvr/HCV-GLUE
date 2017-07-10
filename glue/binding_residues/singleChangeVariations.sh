
echo "reference REF_MASTER_NC_004102"
echo "  feature-location precursor_polyprotein"


for i in `echo 1 2 3 4 5 6`
do
    for j in `cat data/AL_${i}_unique_1diffs.txt`
    do
        echo "    create variation singleBrDiff_Gt${i}_${j} --translationType AMINO_ACID" 
        echo "    variation singleBrDiff_Gt${i}_${j}"
        echo "      create pattern-location '${j}' --labeledCodon 439 443" 
        echo "      exit"
    done
done

echo "    exit"
echo "  exit"
