# HELP request_count_all Counts number of requests of path *
# TYPE request_count_all counter
request_count_all{hostname="MBP-de-Sergio"} 11 1589350561345

# HELP request_count_map Counts number of requests of path /map
# TYPE request_count_map counter
request_count_map{hostname="MBP-de-Sergio"} 2 1589350452998

# HELP response_latency_map Records latency of response of path /map
# TYPE response_latency_map gauge
response_latency_map{hostname="MBP-de-Sergio"} 285

# HELP request_count_ages Counts number of requests of path /ages
# TYPE request_count_ages counter
request_count_ages{hostname="MBP-de-Sergio"} 2 1589350327414

# HELP response_latency_ages Records latency of response of path /ages
# TYPE response_latency_ages gauge
response_latency_ages{hostname="MBP-de-Sergio"} 40

# HELP request_count_query Counts number of requests of path /query
# TYPE request_count_query counter
request_count_query{hostname="MBP-de-Sergio"} 4 1589350561345

# HELP response_latency_query Records latency of response of path /query
# TYPE response_latency_query gauge
response_latency_query{hostname="MBP-de-Sergio"} 667

# HELP request_count_ranking Counts number of requests of path /
# TYPE request_count_ranking counter
request_count_ranking{hostname="MBP-de-Sergio"} 3 1589350260718

# HELP response_latency_ranking Records latency of response of path /
# TYPE response_latency_ranking gauge
response_latency_ranking{hostname="MBP-de-Sergio"} 173

# HELP error_count_ranking Counts number of errors of path /
# TYPE error_count_ranking counter
error_count_ranking{hostname="MBP-de-Sergio"} 1 1589350295005

# HELP error_count_ages Counts number of errors of path /ages
# TYPE error_count_ages counter
error_count_ages{hostname="MBP-de-Sergio"} 1 1589350357418

# HELP error_count_map Counts number of errors of path /map
# TYPE error_count_map counter
error_count_map{hostname="MBP-de-Sergio"} 1 1589350483001

# HELP error_count_query Counts number of errors of path /query
# TYPE error_count_query counter
error_count_query{hostname="MBP-de-Sergio"} 1 1589350485070