# HELP events_count_register_credential Counts number of events named CredentialRegistered
# TYPE events_count_register_credential counter
events_count_register_credential{hostname="MBP-de-Sergio"} 7 1589352788230

# HELP events_count_recovery Counts number of credentials registered of type Recovery
# TYPE events_count_recovery counter
events_count_recovery{hostname="MBP-de-Sergio"} 3 1589352788230

# HELP register_credential_latency Records latency of Register Credential method
# TYPE register_credential_latency gauge
register_credential_latency{hostname="MBP-de-Sergio"} 361

# HELP events_count_confinement Counts number of credentials registered of type Confinement
# TYPE events_count_confinement counter
events_count_confinement{hostname="MBP-de-Sergio"} 1 1589352645547

# HELP events_count_interruption Counts number of credentials registered of type Interruption
# TYPE events_count_interruption counter
events_count_interruption{hostname="MBP-de-Sergio"} 1 1589352650459

# HELP events_count_symptoms Counts number of credentials registered of type Symptoms
# TYPE events_count_symptoms counter
events_count_symptoms{hostname="MBP-de-Sergio"} 1 1589352652398

# HELP events_count_infection Counts number of credentials registered of type Infection
# TYPE events_count_infection counter
events_count_infection{hostname="MBP-de-Sergio"} 1 1589352654261

# HELP events_count_revoke_credential Counts number of events named CredentialRevoked
# TYPE events_count_revoke_credential counter
events_count_revoke_credential{hostname="MBP-de-Sergio"} 1 1589352669969

# HELP block_count Counts number of blocks of received from eventeum
# TYPE block_count counter
block_count{hostname="MBP-de-Sergio"} 1 1589352741673

# HELP block_height Latest block height received from eventeum
# TYPE block_height gauge
block_height{hostname="MBP-de-Sergio"} 258

# HELP register_credential_error_count Counts number of errors of Register Credential method
# TYPE register_credential_error_count counter
register_credential_error_count{hostname="MBP-de-Sergio"} 1 1589352818233