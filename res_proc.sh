#!/bin/bash

input_file=$1

# read input file and calculate mean and standard deviation for each category
awk -F "," '{
#sum all values, all square values and count grouping them by values (categories) found in 3rd column
    sum[$3] += $2;
    sumsq[$3] += $2*$2;
    count[$3] += 1;

#sum all values, all square values and count through entire data
    total_sum += $2; # sum 
    total_sumsq += $2*$2;
    total_count += 1;
}

END {
    for (category in count) {

        #maths transformation of original formula for standard deviation has been used 
        #to calculate stdev from sumsq, sum and average
        #note: that division for both stdev and confidence interval is made by count-1.
        #this is due we calculate them for sample and not entire population, thus 
        #Bessel Correction is used.

        avg = sum[category]/count[category];

        stdev = sqrt((sumsq[category]-sum[category]*avg)/count[category]-1);
        
        z = 1.960; # confidence level value for alpha=0.05
        ci95 = z * stdev / sqrt(count[category]-1);
        
        z = 2.576; # confidence level value for alpha=0.01
        ci99 = z * stdev / sqrt(count[category]-1);
        
        printf "Category %s: Mean = %.2f, 95%% CI [%.2f, %.2f], 99%% CI [%.2f, %.2f], Count = %d, stdev = %.2f\n", category, avg, avg - ci95, avg + ci95, avg - ci99, avg + ci99, count[category], stdev;
    }
    
    avg = total_sum/total_count;

    stdev = sqrt((total_sumsq-total_sum*avg)/total_count-1);

    z = 1.960; # z-quantile for alpha=0.05
    ci95 = z * stdev / sqrt(total_count-1);


    z = 2.576; # z-quantile for alpha=0.01
    ci99 = z * stdev / sqrt(total_count-1);


    printf "TOTAL: Mean = %.2f, 95%% CI [%s, %s], 99%% CI [%s, %s], Count = %d, stdev = %.2f\n", avg, avg - ci95, avg + ci95, avg - ci99, avg + ci99, total_count, stdev;

}' "$input_file"
