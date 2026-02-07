//
//  CourseService.swift
//  ELearningApp
//

import Foundation

class CourseService {
    static let shared = CourseService()
    private let apiClient = APIClient.shared
    
    func getAllCourses() async throws -> [Course] {
        let response: ListResponse<Course> = try await apiClient.request(
            endpoint: .getAllCourses,
            method: .get
        )
        return response.data
    }
    
    func getMyCourses() async throws -> [Course] {
        let response: ListResponse<Course> = try await apiClient.request(
            endpoint: .getMyCourses,
            method: .get
        )
        return response.data
    }
    
    func getCoursesByGrade(grade: String) async throws -> [Course] {
        let response: ListResponse<Course> = try await apiClient.request(
            endpoint: .getCoursesByGrade(grade: grade),
            method: .get
        )
        return response.data
    }
    
    func getCourseDetails(courseId: String) async throws -> Course {
        let response: APIResponse<Course> = try await apiClient.request(
            endpoint: .getCourseDetails(courseId: courseId),
            method: .get
        )

        guard let course = response.data else {
            throw URLError(.resourceUnavailable)
        }

        return course
    }

  
    
    func updateCourse(courseId: String, updates: UpdateCourseRequest) async throws -> Course {
        let response: APIResponse<Course> = try await apiClient.request(
            endpoint: .updateCourse(courseId: courseId),
            method: .put,
            body: updates
        )

        guard let course = response.data else {
            throw NSError(
                domain: "CourseService",
                code: 400,
                userInfo: [
                    NSLocalizedDescriptionKey: response.message ?? "Cập nhật khóa học thất bại"
                ]
            )
        }

        return course
    }
    func deleteCourse(courseId: String) async throws {
        let response: APIResponse<Empty> = try await apiClient.request(
            endpoint: .deleteCourse(courseId: courseId),
            method: .delete
        )

        guard response.status == "success" else {
            throw NSError(
                domain: "CourseService",
                code: 400,
                userInfo: [
                    NSLocalizedDescriptionKey: response.message ?? "Xóa khóa học thất bại"
                ]
            )
        }
    }

    func getCourseProgress(courseId: String) async throws -> CourseProgress {
        let response: APIResponse<CourseProgress> = try await apiClient.request(
            endpoint: .getCourseProgress(courseId: courseId),
            method: .get
        )

        guard let progress = response.data else {
            throw NSError(
                domain: "CourseService",
                code: 404,
                userInfo: [
                    NSLocalizedDescriptionKey: response.message ?? "Không tìm thấy tiến độ khóa học"
                ]
            )
        }

        return progress
    }

}
