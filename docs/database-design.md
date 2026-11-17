# Database Design

- **User:** name, email, passwordHash, role (admin/staff), counterId, officeId
- **Office:** name, address
- **Service:** officeId, department, name, avgDurationMin, dailyTokenLimit, openTime, closeTime
- **Counter:** officeId, name, serviceIds[], status (open/paused/closed), staffId
- **Token:** tokenNo, citizenName, mobile, email, serviceId, date, status, counterId, priority, createdAt, calledAt, completedAt