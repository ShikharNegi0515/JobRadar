import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity.js';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.skillsRepository.find({ order: { name: 'ASC' } });
  }

  async findOrCreate(name: string): Promise<Skill> {
    const normalized = this.normalize(name);
    let skill = await this.skillsRepository.findOne({ where: { name: normalized } });
    if (!skill) {
      skill = this.skillsRepository.create({ name: normalized });
      skill = await this.skillsRepository.save(skill);
    }
    return skill;
  }

  private normalize(name: string): string {
    const map: Record<string, string> = {
      'node': 'Node.js',
      'nodejs': 'Node.js',
      'node.js': 'Node.js',
      'react': 'React',
      'reactjs': 'React',
      'react.js': 'React',
      'postgres': 'PostgreSQL',
      'postgresql': 'PostgreSQL',
      'mongo': 'MongoDB',
      'mongodb': 'MongoDB',
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes',
      'aws': 'AWS',
      'docker': 'Docker',
      'redis': 'Redis',
      'nestjs': 'NestJS',
      'express': 'Express.js',
      'expressjs': 'Express.js',
      'vuejs': 'Vue.js',
      'vue': 'Vue.js',
      'angularjs': 'Angular',
      'angular': 'Angular',
      'nextjs': 'Next.js',
      'next.js': 'Next.js',
    };
    const lower = name.toLowerCase().trim();
    return map[lower] || name.trim();
  }
}
